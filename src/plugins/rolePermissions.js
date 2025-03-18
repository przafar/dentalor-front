export const rolePermissions = {
    super_admin: [
        'patient_index',
        'organization_index',
        'practitioner_index',
        'service_index',
        'patient_index',
        'appointment_index',
        'dashboard_index'
    ],

    admin: [
        'patient_index',
        'practitioner_index',
        'service_index',
        'patient_index',
        'appointment_index',
        'dashboard_index'
    ],

    monitoring: [
        'patient_index',
        'practitioner_index',
        'service_index',
        'appointment_index'
    ],

    reception: [
        'patient_index',
        'appointment_index',
        'service_index'
    ],

    inpatient: [
        'patient_index',
        'appointment_index',
        'service_index'
    ],

};
