import logging
from django.http import HttpResponseServerError
from app.plugins import PluginBase, Menu, MountPoint
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils.translation import gettext as _
# from django.views.generic import TemplateView
import json, shutil
from .models import PatchCrack
from .utils import get_crack_data, get_memory_stats
from .app_views import LoadButtonView


logger = logging.getLogger(__name__)


# def get_crack_data():
#     results = PatchCrack.objects.using('mariadb').all()
#     return list(results.values())





class Plugin(PluginBase):
    def include_js_files(self):
        return ["main.js", "load_buttons.js"]
        
    def main_menu(self):
        return [Menu(_("Crack Annotations"), self.public_url(""), "fa fa-chart-pie fa-fw")]

    def app_mount_points(self):
        @login_required
        def diagnostic(request):
            # Disk space
            total_disk_space, used_disk_space, free_disk_space = shutil.disk_usage('./')

            # Get crack data
            crack_data = PatchCrack.objects.using('mariadb').all()

            template_args = {
                'title': 'Diagnostic1',
                'total_disk_space': total_disk_space,
                'used_disk_space': used_disk_space,
                'free_disk_space': free_disk_space,
                'crack_data': crack_data  # Pass crack data to template
            }

            # Memory (Linux only)
            memory_stats = get_memory_stats()
            if 'free' in memory_stats:
                template_args['free_memory'] = memory_stats['free']
                template_args['used_memory'] = memory_stats['used']
                template_args['total_memory'] = memory_stats['total']

            return render(request, self.template_path("diagnostic1.html"), template_args)

        return [
            MountPoint('$', diagnostic),
            MountPoint("load_buttons.js$", LoadButtonView(self)),
            ]


