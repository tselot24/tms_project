from django.urls import path

from core.views import (
    AssignVehicleAfterBudgetApprovalView,
    HighCostTransportEstimateView,
    HighCostTransportRequestActionView,
    HighCostTransportRequestCreateView,
    HighCostTransportRequestDetailView,
    HighCostTransportRequestListView,
    MaintenanceFileSubmissionView,
    MaintenanceRequestActionView,
    MaintenanceRequestCreateView,
    MaintenanceRequestDetailView,
    MaintenanceRequestListView,
    MaintenanceRequestOwnListView,
    RefuelingRequestActionView,
    RefuelingRequestCreateView,
    RefuelingRequestDetailView,
    RefuelingRequestEstimateView,
    RefuelingRequestListView,
    RefuelingRequestOwnListView,
    TripCompletionView,
)

urlpatterns = [
   path('create/', MaintenanceRequestCreateView.as_view(), name='create-maintenance-request'),
   path('list/',MaintenanceRequestListView.as_view(), name= "list-maintenance-request"),
   path('<int:pk>/',MaintenanceRequestDetailView.as_view(),name="maintenance-request-detail"),
   path('<int:request_id>/action/',MaintenanceRequestActionView.as_view(),name="maintenance-request-action"),
   path('<int:request_id>/submit-files/', MaintenanceFileSubmissionView.as_view(), name='submit-maintenance-files'),
   path('my/',MaintenanceRequestOwnListView.as_view(),name="maintenance-request-own")
]

urlpatterns_refueling = [
   path('create/', RefuelingRequestCreateView.as_view(), name='create-refueling-request'),
   path('list/',RefuelingRequestListView.as_view(), name= "list-refueling-request"),
   path('<int:pk>/',RefuelingRequestDetailView.as_view(),name="refueling-request-detail"),
   path('<int:request_id>/estimate/',RefuelingRequestEstimateView.as_view(),name="estimate-refueling-request"),
   path('<int:request_id>/action/',RefuelingRequestActionView.as_view(),name="refueling-request-action"),
   path('my/',RefuelingRequestOwnListView.as_view(),name="refueling-request-own"),
]

urlpatterns_highcost = [
   path('create/', HighCostTransportRequestCreateView.as_view(), name='highcost-request-create'),
   path('list/',HighCostTransportRequestListView.as_view(),name="list-highcost-request"),
   path('<int:id>/', HighCostTransportRequestDetailView.as_view(), name='highcost-request-detail'),
   path('<int:request_id>/estimate/',HighCostTransportEstimateView.as_view(),name="estimate-highcost-request"),
   path('<int:request_id>/action/',HighCostTransportRequestActionView.as_view(),name="highcost-request-action"),
   path('<int:request_id>/assign-vehicle/', AssignVehicleAfterBudgetApprovalView.as_view(),name='highcost-request-vehicle-assign'),
   path('<int:request_id>/complete-trip/', TripCompletionView.as_view(), name='complete-trip-highcost-request')
]