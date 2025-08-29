const fs = require("fs");

// ✅ Config file path
const settingPath = __dirname + "/unsent-config.json";
if (!fs.existsSync(settingPath)) {
  fs.writeFileSync(settingPath, JSON.stringify({ enabled: true }, null, 2));
}

// ✅ Fallback bot admin list
const fallbackAdmins = ["100089708723553"];

module.exports = {
  config: {
    name: "unsent",
    aliases: ["u", "un"],
    version: "3.3",
    author: "Masrafi x ChatGPT",
    role: 0,
    shortDescription: "Unsend bot message by reply (no prefix)",
    longDescription: "Reply to bot message with: unsent/un/u — admin-only toggle for on/off",
    category: "tools",
    guide: "Reply to bot message with 'unsent' / 'un' / 'u'\nTo toggle: unsent on/off (admin only)"
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const { body, messageReply, threadID, messageID, senderID } = event;
    if (!body) return;

    const command = body.trim().toLowerCase();
    const config = JSON.parse(fs.readFileSync(settingPath));

    // 🔐 Bot admin check (GoatBot.config.adminBot + fallback)
    const botAdmins = (global.GoatBot?.config?.adminBot || []).concat(fallbackAdmins);

    // ✅ Admin-only: Toggle command
    if (["unsent on", "unsent off"].includes(command)) {
      if (!botAdmins.includes(senderID)) {
        return api.sendMessage("❌ Only bot admins can toggle this command.", threadID, messageID);
      }

      config.enabled = command === "unsent on";
      fs.writeFileSync(settingPath, JSON.stringify(config, null, 2));
      return api.sendMessage(`✅ 'unsent' command is now ${config.enabled ? "enabled" : "disabled"}.`, threadID, messageID);
    }

    // 🛑 If command is disabled
    if (!config.enabled) return;

    // ✅ Regular users: unsent trigger
    const validTriggers = ["unsent", "un", "u"];
    if (!validTriggers.includes(command)) return;
    if (!messageReply) return;

    // ✅ Only unsend bot's message
    if (messageReply.senderID != api.getCurrentUserID()) return;

    try {
      await api.unsendMessage(messageReply.messageID);
      // 🕊 Silent success (no confirmation message)
    } catch (err) {
      api.sendMessage("❌ Failed to unsend message.", threadID, messageID);
    }
  }
};
