from .models import PatchCrack
from django.core.serializers.json import DjangoJSONEncoder
from django.forms.models import model_to_dict

def get_crack_data(filters=None):
    results = PatchCrack.objects.using('mariadb')
    if filters:
        results = results.filter(**filters)
    return [model_to_dict(result) for result in results]

def get_memory_stats():
    """
    Get node total memory and memory usage (Linux only)
    """
    try:
        with open('/proc/meminfo', 'r') as mem:
            ret = {}
            tmp = 0
            for i in mem:
                sline = i.split()
                if str(sline[0]) == 'MemTotal:':
                    ret['total'] = int(sline[1])
                elif str(sline[0]) in ('MemFree:', 'Buffers:', 'Cached:'):
                    tmp += int(sline[1])
            ret['free'] = tmp
            ret['used'] = int(ret['total']) - int(ret['free'])

            ret['total'] *= 1024
            ret['free'] *= 1024
            ret['used'] *= 1024
        return ret
    except:
        return {}