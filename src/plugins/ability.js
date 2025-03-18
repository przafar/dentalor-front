import { Ability, AbilityBuilder } from '@casl/ability';
import { rolePermissions } from './rolePermissions';

export function defineAbilitiesFor(user) {
    const { can, cannot, rules } = new AbilityBuilder(Ability);

    user?.role?.forEach((role) => {
        if (rolePermissions[role]) {
            rolePermissions[role].forEach((perm) => {
                can(perm);
            });
        }
    });

    user?.permissions?.forEach((perm) => {
        can(perm);
    });

    if (!user) {
        can('logout');
    }

    return new Ability(rules);
}
