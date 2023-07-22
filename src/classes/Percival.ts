import Role from "./Role";
import { Role as RoleType, team } from "../types";

export default class Percival extends Role {
  name = "퍼시발" as RoleType;
  description = "멀린과 모르가나를 확인할 수 있습니다.";
  visibleRoles = ["멀린", "모르가나"] as RoleType[];
  team = "BLUE" as team;
}
