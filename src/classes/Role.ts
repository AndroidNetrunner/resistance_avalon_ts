import { Role as RoleType, team } from "../types";

abstract class Role {
  public abstract readonly name: RoleType;
  public abstract readonly description: string;
  public abstract readonly visibleRoles: RoleType[];
  public abstract readonly team: team;
}

export default Role;
