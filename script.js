// config.js

const AppConfig = {
    // The list of behaviors to generate rows for
    behaviors: [
        "Not doing Homework",
        "Being late 4 times",
        "Being late 6 times",
        "Skipping class",
        "Skipping school",
        "Talking in class",
        "Playing video games in class",
        "Being on phone in class",
    ],

    // SCORING FORMULAS
    math: {
        // Simple punishments
        none: 0,
        lunchDetention: 5, // Legacy simple option if you want it
        
        // Detention Calculation Settings
        detention: {
            basePerHour: 15,    // Points per hour of detention
            saturdayMultiplier: 2.0, // Saturday is 2x as harsh
            lunchMultiplier: 0.8,    // Lunch is 1.5x as harsh
            fridayBonus: 20,         // Flat points added for "Friday Only" evilness
        },

        // Homework Calculation Settings
        homework: {
            points perMinute: 0.5 // 30 mins = 15 points
        }
    }
};
