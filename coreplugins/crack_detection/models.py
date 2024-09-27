from django.db import models

class PatchCrack(models.Model):
    CRACK_TYPE_CHOICES = [
        ('none', 'None'),
        ('crack', 'Crack'),
        ('stain', 'Stain'),
        ('spall', 'Spall'),
    ]
    uid = models.AutoField(primary_key=True)
    center_lat = models.CharField(max_length=255, null=True, blank=True)
    center_long = models.CharField(max_length=255, null=True, blank=True)
    center_alt = models.CharField(max_length=255, null=True, blank=True)
    box_length = models.CharField(max_length=255, null=True, blank=True)
    box_width = models.CharField(max_length=255, null=True, blank=True)
    box_height = models.CharField(max_length=255, null=True, blank=True)
    length_area = models.FloatField(null=True, blank=True)  # New field
    type = models.CharField(max_length=5, choices=CRACK_TYPE_CHOICES, null=True, blank=True)
    las_link = models.CharField(max_length=255, null=True, blank=True)
    whole_data_id = models.CharField(max_length=255, null=True, blank=True)
    time = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'auto_crack_annotation'
        db_table = 'patch_crack'
        managed = True

    def __str__(self):
        return f"Patch Crack {self.uid}: {self.type}"