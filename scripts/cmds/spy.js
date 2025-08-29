module.exports = {
  config: {
    name: "spy",
    version: "2.0",
    author: "Mashrafi",
    countDown: 60,
    role: 0,
    shortDescription: "Realistic user scan",
    longDescription: "Realistically scans Facebook user and sends info with avatar",
    category: "image",
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    let uid;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) uid = match[1];
      }
    }

    if (!uid) {
      uid = event.type === "message_reply" ? event.messageReply.senderID : uid2 || uid1;
    }

    // Step 1: Realistic delay-based processing messages
    await message.reply("⏳ Processing started...");
    await new Promise(resolve => setTimeout(resolve, 1500));

    await message.reply("🕵 Scanning Facebook user...");
    await new Promise(resolve => setTimeout(resolve, 1500));

    await message.reply("🕐 Please wait while we fetch the data securely...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Fetching data
    api.getUserInfo(uid, async (err, userInfo) => {
      if (err) return message.reply("❌ Failed to retrieve user information.");

      const avatarUrl = await usersData.getAvatarUrl(uid);

      // Gender mapping
      let genderTextEn, genderTextJp;
      switch (userInfo[uid].gender) {
        case 1:
          genderTextEn = "Girl 👧";
          genderTextJp = "女の子 👧";
          break;
        case 2:
          genderTextEn = "Boy 👦";
          genderTextJp = "男の子 👦";
          break;
        default:
          genderTextEn = "Unknown ❓";
          genderTextJp = "不明 ❓";
      }

      // Birthday text
      const birthdayEn = userInfo[uid].isBirthday ? "Yes 🎉" : "No ❌";
      const birthdayJp = userInfo[uid].isBirthday ? "はい 🎉" : "いいえ ❌";

      // Friend text
      const friendEn = userInfo[uid].isFriend ? "Yes ✅" : "No ❌";
      const friendJp = userInfo[uid].isFriend ? "はい ✅" : "いいえ ❌";

      // Final formatted message with English + Japanese
      const userInformation = 
`━━━━━━━━━━━━━━━
🔎 𝗨𝘀𝗲𝗿 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 | ユーザー情報
━━━━━━━━━━━━━━━
👤 𝗡𝗮𝗺𝗲 | 名前: ${userInfo[uid].name}
🆔 𝗨𝗜𝗗: ${uid}
🌐 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 | プロフィール: ${userInfo[uid].profileUrl}

⚧ 𝗚𝗲𝗻𝗱𝗲𝗿 | 性別: ${genderTextEn} / ${genderTextJp}
🎂 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆 𝗧𝗼𝗱𝗮𝘆 | 今日誕生日: ${birthdayEn} / ${birthdayJp}
👥 𝗙𝗿𝗶𝗲𝗻𝗱 | 友達: ${friendEn} / ${friendJp}

🧾 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗧𝘆𝗽𝗲 | アカウントタイプ: ${userInfo[uid].type}
📅 𝗜𝗻𝗳𝗼 𝗖𝗵𝗲𝗰𝗸𝗲𝗱 | 情報確認日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}

━━━━━━━━━━━━━━━
🤖 𝗕𝗼𝘁 𝗦𝗽𝘆 𝗦𝗰𝗮𝗻 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 ✔ | スキャン完了 ✔
━━━━━━━━━━━━━━━`;

      // Step 3: Send final info + avatar
      message.reply({
        body: userInformation,
        attachment: await global.utils.getStreamFromURL(avatarUrl)
      });
    });
  }
};
