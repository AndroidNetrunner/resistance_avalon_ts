import Role from "./Role";
import { Role as RoleType, team } from "../types";

export default class Loyal extends Role {
  name = "선의 세력" as RoleType;
  description = "미션을 3번 성공하여 게임에서 승리하세요!";
  visibleRoles = [] as RoleType[];
  team = "BLUE" as team;
}
