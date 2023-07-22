import Role from "./Role";
import { Role as RoleType, team } from "../types";

export default class Morgana extends Role {
  name = "모르가나" as RoleType;
  description = "퍼시발에게 당신은 멀린 후보로 보입니다.";
  visibleRoles = ["암살자", "모드레드", "악의 하수인"] as RoleType[];
  team = "RED" as team;
}
