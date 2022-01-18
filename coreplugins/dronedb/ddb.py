from functools import reduce
import requests
from os import path
from app.plugins import logger
from urllib.parse import urlparse

VALID_IMAGE_EXTENSIONS = ['.tiff', '.tif', '.png', '.jpeg', '.jpg']
DEFAULT_HUB_URL = 'https://hub.droneDB.app'

class DroneDB:
  
    def __init__(self, registry_url, username, password, token=None, update_token=None):

        if not self.validate_url(registry_url):
            raise ValueError("Invalid registry URL.")

        self.username = username
        self.password = password
        self.token = token
        self.public = False if username else True
        self.update_token = update_token
        
        self.__registry_url = registry_url[:-1] if registry_url.endswith('/') else registry_url
        self.__authenticate_url = self.__registry_url + "/users/authenticate"
        self.__refresh_url = self.__registry_url + "/users/authenticate/refresh"
        self.__get_organizations_url = self.__registry_url + "/orgs"
        self.__get_datasets_url = self.__registry_url + "/orgs/{0}/ds"
        self.__get_folders_url = self.__registry_url + "/orgs/{0}/ds/{1}/search"
        self.__get_files_list_url = self.__registry_url + "/orgs/{0}/ds/{1}/list"
        self.__download_file_url = self.__registry_url + "/orgs/{0}/ds/{1}/download?path={2}&inline=1"
 
    # Validate url
    def validate_url(self, url):
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False

    def login(self):

        if (self.public):
            logger.info("No need to login to DroneDB.")
            return True

        try:

            # Authenticate
            payload = {'username': self.username, 'password': self.password}
            response = requests.post(self.__authenticate_url, data=payload)

            if response.status_code != 200:
                return False

            # Get the token
            self.token = response.json()['token']

            logger.info("Logged in to DroneDB as user " + self.username + ".")    

            if (self.update_token is not None):
                self.update_token(self.token)

            return True
        
        except(Exception) as e:
            logger.error(e)
            return False             
    
    def wrapped_call(self, type, url, data=None, params=None, attempts=3):
        
        headers = {}
        
        cnt = attempts

        while True:
                           
            if not self.public and self.token is None and not self.login():
                raise ValueError("Could not authenticate to DroneDB.")
            
            if self.token is not None:
                headers = {'Authorization': 'Bearer ' + self.token }
                
            response = requests.request(type, url, data=data, params=params, headers=headers)
                        
            if response.status_code == 200:
                return response
            
            if response.status_code == 401:            
                if (self.public):
                    raise Exception("Failed to call '" + url + "'.")
                
                if not self.login():
                    raise Exception("Failed to re-authenticate to DroneDB, cannot call '" + url + "'.")
                else:
                    cnt -= 1
                    if cnt == 0:
                        raise Exception("Failed all attempts to re-authenticate to DroneDB, cannot call '" + url + "'.")
            else:
                raise Exception("Failed to call '" + url + "'.")        
        

    def get_organizations(self):
       
        try:
        
            response = self.wrapped_call('GET', self.__get_organizations_url)

            return [{'slug': o['slug'], 'name': o['name']} for o in response.json()]
        
        except Exception as e:
            raise Exception("Failed to get organizations.") from e

    def get_datasets(self, orgSlug):
        
        try:
            
            response = self.wrapped_call('GET', self.__get_datasets_url.format(orgSlug))

            return [
                {'slug': o['slug'], 
                'name': o['properties'].get('meta', {}).get('name', {}).get('data', o['name']), 
                'public': o['properties'].get('public'), 
                'size': o['size'], 
                'entries': o['properties'].get('entries')
                } for o in response.json()]
        
        except Exception as e:
            raise Exception("Failed to get datasets.") from e
               
    
    def get_folders(self, orgSlug, dsSlug):
        
        try:
            
            # Type 1 is folder
            payload = {'query': '*', 'recursive': True, 'type': 1}

            response = self.wrapped_call('POST', self.__get_folders_url.format(orgSlug, dsSlug), data=payload)

            return [o['path'] for o in response.json()]        
                
        except Exception as e:
            raise Exception("Failed to get folders.") from e

    def get_files_list(self, orgSlug, dsSlug, folder=None):
        
        try:
                    
            # Type 1 is folder
            params = {'path': '' if folder is None else folder}

            logger.info(self.__get_files_list_url.format(orgSlug, dsSlug))

            # Get the folders
            response = self.wrapped_call('GET', self.__get_files_list_url.format(orgSlug, dsSlug), params=params)

            return [
                {'path': o['path'], 
                # extract name from path
                'name': o['path'].split('/')[-1],
                'type': o['type'], 
                'size': o['size'],
                'url': self.__download_file_url.format(orgSlug, dsSlug, o['path'])
                } for o in response.json()]
            
        except Exception as e:
            raise Exception("Failed to get files list.") from e

def verify_url(url, username=None, password=None):
    try:

        registryUrl, orgSlug, dsSlug, folder = parse_url(url).values()

        ddb = DroneDB(registryUrl, username, password)
        files = ddb.get_files_list(orgSlug, dsSlug, folder)

        # return some info
        return {
            'success': True,
            'orgSlug': orgSlug, 
            'dsSlug': dsSlug, 
            'folder': folder, 
            'count': len(files), 
            'size': sum(i['size'] for i in files)
        }

    except Exception as e:
        logger.error(e)
        return {
            'success': False,
            'orgSlug': None, 
            'dsSlug': None, 
            'folder': None, 
            'count': None, 
            'size': None
        }

def parse_url(url):

    # Check if the url is valid
    # Root folder of dataset:       ddb://localhost:5001/admin/4uyyyaxcbvahd7qb
    # 'test' folder of dataset:     ddb://localhost:5001/admin/4uyyyaxcbvahd7qb/test
    # using http instead of https:  ddb+unsafe://localhost:5000/admin/4uyyyaxcbvahd7qb
    # using hub url:                https://localhost:5001/r/admin/4uyyyaxcbvahd7qb
    # using hub url without /r/     http://localhost:5000/admin/4uyyyaxcbvahd7qb/test

    p = urlparse(url)
    segments = p.path.split('/')

    if p.scheme not in ['ddb', 'ddb+unsafe', 'http', 'https']:
        raise ValueError("Invalid URL scheme.")

    if p.netloc == '':
        raise ValueError("Invalid URL.")
    
    scheme = p.scheme

    # used to skip the /r/: if ddb url we have no /r/ instead if http we have it
    if p.scheme == 'ddb':
        scheme = 'https'       
    elif p.scheme == 'ddb+unsafe':
        scheme = 'http' 
        
    offset = 1 if segments[1] == 'r' else 0
              
    if (len(segments) < offset + 3):
        raise ValueError("Invalid URL.")

    return {
        'registryUrl': scheme + '://' + p.netloc,
        'orgSlug': segments[1 + offset],
        'dsSlug': segments[2 + offset],
        'folder': '/'.join(segments[3 + offset:])
    }

    