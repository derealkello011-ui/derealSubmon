import adobe from '@/assets/icons/adobe.png';
import ai from '@/assets/icons/ai.png';
import analytics from '@/assets/icons/analytics_24.png';
import canva from '@/assets/icons/canva.png';
import chatgpt from '@/assets/icons/chatgpt.png';
import claude from '@/assets/icons/claude-ai.png';
import cursor from '@/assets/icons/cursor-ai.png';
import insights from '@/assets/icons/data_exploration.png';
import dropbox from '@/assets/icons/dropbox.png';
import figma from '@/assets/icons/figma.png';
import github from '@/assets/icons/github.png';
import home from '@/assets/icons/home_24.png';
import medium from '@/assets/icons/icons8-medium-50.png';
import notion from '@/assets/icons/notion.png';
import settings from '@/assets/icons/settings_24.png';
import spotify from '@/assets/icons/spotify.png';
import subscribe from '@/assets/icons/subscribe.png';
import wallet from '@/assets/icons/wallet.png';

export const icons = {
    claude, ai, medium, notion,
    canva, chatgpt, spotify,
    cursor, dropbox, github, figma,
    home, analytics, insights, settings,
    wallet, subscribe, adobe,
}

export type IconKey = keyof typeof icons;

