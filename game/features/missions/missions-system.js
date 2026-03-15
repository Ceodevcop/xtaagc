class MissionsSystem {
    constructor() {
        this.tiers = {
            bronze: {
                requirements: { dailyLogin: 1, gamesPlayed: 1 },
                rewards: { xtp: 10, botTrial: '1hour' },
                unlockNext: { missionsCompleted: 5 }
            },
            silver: {
                requirements: { referrals: 3, gamesPlayed: 10, xtpBalance: 1000 },
                rewards: { xtp: 100, botRental: '24hours' },
                unlockNext: { missionsCompleted: 20, xtpBalance: 5000 }
            },
            gold: {
                requirements: { 
                    referrals: 10, 
                    gamesPlayed: 100, 
                    xtpBalance: 10000,
                    streak: 30 // days
                },
                rewards: { xtp: 1000, exclusiveBot: true, feeDiscount: 0.5 }
            }
        };

        this.dailyMissions = [
            { id: 'login', description: 'Login to the platform', reward: 5 },
            { id: 'play_game', description: 'Play 1 game', reward: 10 },
            { id: 'run_bot', description: 'Run a bot for 1 hour', reward: 20 },
            { id: 'refer_friend', description: 'Refer a friend', reward: 50 }
        ];

        this.weeklyMissions = [
            { id: 'weekly_plays', description: 'Play 50 games this week', reward: 100 },
            { id: 'weekly_volume', description: 'Trade 10,000 XTP volume', reward: 200 },
            { id: 'weekly_referrals', description: 'Refer 5 friends', reward: 250 }
        ];

        this.activeMissions = new Map();
        this.completedMissions = [];
    }

    /**
     * Get user's current missions
     */
    async getUserMissions(userId) {
        const user = await this.getUser(userId);
        const today = new Date().toDateString();
        
        // Get or create daily missions
        let daily = this.activeMissions.get(`${userId}_daily_${today}`);
        if (!daily) {
            daily = this.generateDailyMissions(user);
            this.activeMissions.set(`${userId}_daily_${today}`, daily);
        }

        // Get weekly missions
        const week = this.getWeekNumber();
        let weekly = this.activeMissions.get(`${userId}_weekly_${week}`);
        if (!weekly) {
            weekly = this.generateWeeklyMissions(user);
            this.activeMissions.set(`${userId}_weekly_${week}`, weekly);
        }

        // Check tier progress
        const tierProgress = await this.calculateTierProgress(user);

        return {
            daily,
            weekly,
            tier: {
                current: user.tier || 'bronze',
                progress: tierProgress,
                nextTier: this.getNextTier(user.tier || 'bronze')
            },
            streak: user.streak || 0
        };
    }

    /**
     * Track user activity for mission completion
     */
    async trackActivity(userId, activityType, data = {}) {
        const today = new Date().toDateString();
        const week = this.getWeekNumber();
        
        // Update daily missions
        const dailyKey = `${userId}_daily_${today}`;
        const daily = this.activeMissions.get(dailyKey);
        if (daily) {
            daily.progress[activityType] = (daily.progress[activityType] || 0) + 1;
            
            // Check completion
            for (const mission of daily.missions) {
                if (!mission.completed && this.checkMissionComplete(mission, daily.progress)) {
                    await this.completeMission(userId, mission, 'daily');
                }
            }
        }

        // Update weekly missions
        const weeklyKey = `${userId}_weekly_${week}`;
        const weekly = this.activeMissions.get(weeklyKey);
        if (weekly) {
            weekly.progress[activityType] = (weekly.progress[activityType] || 0) + 1;
            
            for (const mission of weekly.missions) {
                if (!mission.completed && this.checkMissionComplete(mission, weekly.progress)) {
                    await this.completeMission(userId, mission, 'weekly');
                }
            }
        }

        // Check for tier progression
        await this.checkTierProgression(userId);
    }

    /**
     * Complete mission and award rewards
     */
    async completeMission(userId, mission, type) {
        // Award XTP
        await this.awardXTP(userId, mission.reward, `mission_${type}_${mission.id}`);

        // Special rewards
        if (mission.specialReward) {
            await this.awardSpecialReward(userId, mission.specialReward);
        }

        // Track completion
        this.completedMissions.push({
            userId,
            missionId: mission.id,
            type,
            completedAt: Date.now(),
            reward: mission.reward
        });

        // Update user stats
        await this.incrementMissionCount(userId);

        // Check for streak bonus
        await this.updateStreak(userId);

        return true;
    }

    /**
     * Calculate tier progress
     */
    async calculateTierProgress(user) {
        const currentTier = user.tier || 'bronze';
        const tierConfig = this.tiers[currentTier];
        
        const progress = {
            missionsCompleted: user.missionsCompleted || 0,
            referrals: user.referrals || 0,
            gamesPlayed: user.gamesPlayed || 0,
            xtpBalance: user.xtpBalance || 0,
            streak: user.streak || 0
        };

        const requirements = tierConfig.requirements;
        const percentComplete = {};

        for (const [key, required] of Object.entries(requirements)) {
            const current = progress[key] || 0;
            percentComplete[key] = Math.min(100, (current / required) * 100);
        }

        const overall = Object.values(percentComplete).reduce((a, b) => a + b, 0) / 
                       Object.keys(percentComplete).length;

        return {
            current: progress,
            required: requirements,
            percentComplete,
            overall: Math.round(overall)
        };
    }

    generateDailyMissions(user) {
        // Select 3 random daily missions
        const missions = this.shuffleArray(this.dailyMissions).slice(0, 3);
        return {
            date: new Date().toDateString(),
            missions: missions.map(m => ({ ...m, completed: false })),
            progress: {},
            completed: false
        };
    }

    generateWeeklyMissions(user) {
        // Select 3 weekly missions
        const missions = this.weeklyMissions.slice(0, 3);
        return {
            week: this.getWeekNumber(),
            missions: missions.map(m => ({ ...m, completed: false })),
            progress: {},
            completed: false
        };
    }

    getWeekNumber() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneWeek = 604800000;
        return Math.floor(diff / oneWeek);
    }

    shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    checkMissionComplete(mission, progress) {
        return progress[mission.id] >= (mission.requirement || 1);
    }

    async checkTierProgression(userId) {
        const user = await this.getUser(userId);
        const progress = await this.calculateTierProgress(user);
        
        if (progress.overall >= 100) {
            const nextTier = this.getNextTier(user.tier || 'bronze');
            if (nextTier) {
                await this.upgradeTier(userId, nextTier);
            }
        }
    }

    async upgradeTier(userId, newTier) {
        await this.updateUser(userId, { tier: newTier });
        
        // Award tier upgrade bonus
        const bonuses = {
            silver: 500,
            gold: 2000
        };
        
        if (bonuses[newTier]) {
            await this.awardXTP(userId, bonuses[newTier], `tier_upgrade_${newTier}`);
        }
    }
}

module.exports = { MissionsSystem };
