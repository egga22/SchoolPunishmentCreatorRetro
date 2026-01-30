// config.js

const AppConfig = {
    // 1. DEFINE YOUR PUNISHMENT OPTIONS HERE
    // 'id': Internal reference name
    // 'text': What the user sees in the dropdown
    // 'score': How much this adds to the harshness rating
    punishments: [
        { id: "none", text: "No Punishment", score: 0 }, // Added a default '0' option
        { id: "lunchDetention", text: "Lunch detention", score: 5 },
        { id: "extraAssignment", text: "Extra homework", score: 10 },
        { id: "detention", text: "Detention (for 1 hour)", score: 20 },
        { id: "detention2Hours", text: "Detention (for 2 hours)", score: 25 },
        { id: "saturdayDetention", text: "Saturday detention for 3 hours", score: 30 },
        { id: "weekDetention1h", text: "Detention every day (1hr) for 1 week", score: 50 },
        { id: "weekDetention2h", text: "Detention every day (2hr) for 1 week", score: 100 },
        { id: "weekDetention1h2w", text: "Detention every day (1hr) for 2 weeks", score: 100 },
        { id: "weekDetention2h2w", text: "Detention every day (2hr) for 2 weeks", score: 200 }
    ],

    // 2. DEFINE THE BEHAVIORS TO TRACK
    // Just add a new line here to create a new dropdown on the website
    behaviors: [
        "Not doing Homework",
        "Being late 4 times",
        "Being late 6 times",
        "Skipping class",
        "Skipping school",
        "Talking in class",
        "Playing video games in class",
        "Being on phone in class",
        "Leaving classroom before bell",
    ]
};
