from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .utils import get_crack_data, get_memory_stats
from django.core.serializers.json import DjangoJSONEncoder
import json

def LoadButtonView(plugin):
    def view(request):
        ds = plugin.get_user_data_store(request.user)
        token = ds.get_string("token")

        # Load data from the database
        crack_data = get_crack_data(filters={'whole_data_id': '-3'})
        memory_stats = get_memory_stats()

        return render(
            request,
            plugin.template_path("load_buttons.js"),
            {
                "token": token,
                "app_name": plugin.get_name(),
                "api_url": plugin.public_url("").rstrip("/"),
                "ion_url": "https://api.cesium.com/v1",
                "crack_data": json.dumps(crack_data, cls=DjangoJSONEncoder),
                "memory_stats": json.dumps(memory_stats, cls=DjangoJSONEncoder),
            },
            content_type="text/javascript",
        )

    return view