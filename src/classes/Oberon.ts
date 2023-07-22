import Role from "./Role";
import { Role as RoleType, team } from "../types";

export default class Oberon extends Role {
  name = "오베론" as RoleType;
  description = "다른 악의 하수인들과 정체가 공유되지 않습니다.";
  visibleRoles = [] as RoleType[];
  team = "RED" as team;
}
