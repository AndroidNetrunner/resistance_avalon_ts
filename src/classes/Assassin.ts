import Role from "./Role";
import { Role as RoleType, team } from "../types";

export default class Assassin extends Role {
  name = "암살자" as RoleType;
  description = "당신이 멀린 암살에 성공하면 악의 하수인들은 역전승합니다!";
  visibleRoles = ["악의 하수인", "모드레드", "모르가나"] as RoleType[];
  team = "RED" as team;
}
