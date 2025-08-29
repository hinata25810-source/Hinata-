module.exports = {
  config: {
    name: "addmoney",
    version: "1.0",
    author: "Masrafi",
    role: 2, // শুধুমাত্র admin চালাতে পারবে
    shortDescription: "Add money to yourself or others",
    category: "Economy",
  },
  onStart: async function ({ args, message, event, usersData }) {
    const amount = parseInt(args[0]);
    const targetID = args[1] || event.senderID;

    if (isNaN(amount)) return message.reply("⚠ Enter a valid amount.");

    const user = await usersData.get(targetID);
    await usersData.set(targetID, {
      money: user.money + amount,
      data: user.data,
    });

    message.reply(`✅ Added $${amount.toLocaleString()} to <@${targetID}>`, {
      mentions: [{ id: targetID, tag: `<@${targetID}>` }],
    });
  }
};
