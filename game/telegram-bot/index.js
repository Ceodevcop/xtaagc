// Add to your telegram-bot/index.js

const XTPCommands = {
    // XTP Dashboard
    '/xtp': async (ctx) => {
        const user = await getUser(ctx.from.id);
        const message = `
💰 **XTP Ecosystem**

Your XTP Balance: ${user.xtpBalance} XTP
Pending Earnings: ${user.pendingEarnings || 0} XTP
Active Bots: ${user.activeBots || 0}

**Features:**
/shop - D2C Shop (save 30%)
/missions - Daily missions
/creator - Creator network
/subscribe - Subscription tiers
/nft - NFT marketplace
/events - Events & merch
/partners - Partnerships

View online: https://game.taagc.website/xtp-ecosystem
        `;
        ctx.reply(message, { parse_mode: 'Markdown' });
    },

    // Shop command
    '/shop': async (ctx) => {
        const keyboard = {
            inline_keyboard: [
                [{ text: "💵 Buy 100 XTP ($100)", callback_data: "buy_100" }],
                [{ text: "💵 Buy 500 XTP (+25 bonus)", callback_data: "buy_500" }],
                [{ text: "💵 Buy 1000 XTP (+100 bonus)", callback_data: "buy_1000" }],
                [{ text: "👕 Merchandise", callback_data: "merch" }],
                [{ text: "🔗 Generate Affiliate Link", callback_data: "affiliate" }]
            ]
        };
        ctx.reply("💰 **XTP Shop**\nBuy direct and save 30%!", {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    },

    // Missions command
    '/missions': async (ctx) => {
        const missions = getDailyMissions(ctx.from.id);
        let message = "🎯 **Daily Missions**\n\n";
        
        for (const m of missions) {
            message += `${m.completed ? '✅' : '⬜'} ${m.description} - ${m.reward} XTP\n`;
        }
        
        message += `\nStreak: 7 days 🔥\nTier: Bronze (45% to Silver)`;
        
        ctx.reply(message);
    }
};
