export const rolePermissions = {
    super_admin: [
        'main_index',
        'patient_index',
        'organization_index',
        'practitioner_index',
        'service_index',
        'patient_index',
        'appointment_index',
        'payment_index',
        'tv_index'
    ],

    admin: [
        'organization_index',
        'patient_index',
        'practitioner_index',
        'service_index',
        'patient_index',
        'appointment_index',
        'main_index',
        'payment_index',
        'tv_index'
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
        'service_index',
        'payment_index',
        'tv_index'
    ],

    inpatient: [
        'patient_index',
        'appointment_index',
        'service_index',

    ],

};
