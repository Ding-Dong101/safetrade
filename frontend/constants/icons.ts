import home from "@/assets/icons/home.png";
import back from "@/assets/icons/back.png";
import add from "@/assets/icons/add.png";
import menu from "@/assets/icons/menu.png";
import wallet from "@/assets/icons/wallet.png";
import setting from "@/assets/icons/setting.png";
import activity from "@/assets/icons/activity.png";
import spotify from "@/assets/icons/spotify.png";
import notion from "@/assets/icons/notion.png";
import figma from "@/assets/icons/figma.png";
import github from "@/assets/icons/github.png";
import adobe from "@/assets/icons/adobe.png";
import canva from "@/assets/icons/canva.png";
import claude from "@/assets/icons/claude.png";
import openai from "@/assets/icons/openai.png";

export const icons = {
    home,
    back,
    add,
    menu,
    wallet,
    setting,
    activity,
    spotify,
    notion,
    figma,
    github,
    adobe,
    canva,
    claude,
    openai,
} as const;

export type IconKey = keyof typeof icons;