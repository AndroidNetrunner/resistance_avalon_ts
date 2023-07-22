import Role from "./Role";
import { Role as RoleType, team } from "../types";

export default class Evil extends Role {
  name = "악의 하수인" as RoleType;
  description = "미션을 3번 실패시켜 게임에서 승리하세요!";
  visibleRoles = [
    "모드레드",
    "모르가나",
    "암살자",
    "악의 하수인",
  ] as RoleType[];
  team = "RED" as team;
}
