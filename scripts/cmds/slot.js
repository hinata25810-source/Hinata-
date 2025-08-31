module.exports = {
  config: {
    name: "slot",
    version: "1.5",
    author: "Masrafi",
    shortDescription: {
      en: "Clean slot game with realistic multipliers and % bets",
    },
    category: "Game",
  },
  langs: {
    en: {
      invalid_amount: "⚠ Enter a valid positive amount (e.g., 50k, 1M, 2B, 10%) or 'all'.",
      not_enough_money: "💰 Not enough balance for this bet.",
      spin_message: "🎰 Spinning the reels...",
    },
  },
  onStart: async function({ args, message, event, usersData, getLang, api }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);

    // Parse amount (k/m/b/t, %, or all)
    function parseAmount(input, totalMoney) {
      if (!input) return NaN;
      let str = input.toString().toLowerCase().trim();
      
      if (str === "all") return totalMoney;

      // Handle %
      if (str.endsWith("%")) {
        const percent = parseFloat(str.slice(0, -1));
        if (isNaN(percent) || percent <= 0) return NaN;
        return Math.floor(totalMoney * (percent/100));
      }

      // Handle k/m/b/t
      let multiplier = 1;
      if (str.endsWith("k")) multiplier = 1e3;
      else if (str.endsWith("m")) multiplier = 1e6;
      else if (str.endsWith("b")) multiplier = 1e9;
      else if (str.endsWith("t")) multiplier = 1e12;
      if ("kmbt".includes(str.slice(-1))) str = str.slice(0, -1);
      const num = parseFloat(str);
      return isNaN(num) || num <= 0 ? NaN : Math.floor(num * multiplier);
    }

    function formatNumber(num) {
      if (typeof num !== "number") num = Number(num);
      if (num === 0) return "0";
      const absNum = Math.abs(num);
      if (absNum >= 1e12) return (num / 1e12).toFixed(2).replace(/\.?0+$/, '') + "T";
      if (absNum >= 1e9) return (num / 1e9).toFixed(2).replace(/\.?0+$/, '') + "B";
      if (absNum >= 1e6) return (num / 1e6).toFixed(2).replace(/\.?0+$/, '') + "M";
      if (absNum >= 1e3) return (num / 1e3).toFixed(2).replace(/\.?0+$/, '') + "K";
      return num.toString();
    }

    let amount = parseAmount(args[0], userData.money);
    if (isNaN(amount) || amount <= 0) return message.reply(getLang("invalid_amount"));
    if (amount > userData.money) return message.reply(getLang("not_enough_money"));

    const slots = ["🍒","🍋","🔔","🍀","⭐"];
    const slot1 = slots[Math.floor(Math.random()*slots.length)];
    const slot2 = slots[Math.floor(Math.random()*slots.length)];
    const slot3 = slots[Math.floor(Math.random()*slots.length)];

    function calculateWinnings(slot1, slot2, slot3, betAmount) {
      if (slot1 === slot2 && slot2 === slot3) {
        switch(slot1) {
          case "🍒": return betAmount * 5;
          case "🍋": return betAmount * 8;
          case "🔔": return betAmount * 10;
          case "🍀": return betAmount * 15;
          case "⭐": return betAmount * 20;
        }
      }
      if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
        const counts = {};
        [slot1, slot2, slot3].forEach(s => counts[s] = (counts[s]||0)+1);
        const pairSymbol = Object.keys(counts).find(k=>counts[k]===2);
        switch(pairSymbol){
          case "🍒": return betAmount*2;
          case "🍋": return betAmount*2.5;
          case "🔔": return betAmount*3;
          case "🍀": return betAmount*4;
          case "⭐": return betAmount*5;
        }
      }
      return -betAmount;
    }

    const winnings = calculateWinnings(slot1, slot2, slot3, amount);
    const multiplier = winnings > 0 ? (winnings/amount).toFixed(2) : 0;
    await usersData.set(senderID, { money: userData.money + winnings, data: userData.data });

    const spinArt = `🎰  [ ${slot1} | ${slot2} | ${slot3} ]`;
    const betInfo = `💵 Bet: $${formatNumber(amount)} | 🔢 Multiplier: ${multiplier}x`;
    let resultMessage = winnings > 0
      ? (slot1===slot2 && slot2===slot3
          ? `🌟 JACKPOT! You won $${formatNumber(winnings)} (${multiplier}x) with three ${slot1} symbols!`
          : `🎉 You won $${formatNumber(winnings)} (${multiplier}x)!`)
      : `😞 You lost $${formatNumber(-winnings)}.`;

    const finalMessage = `${spinArt}\n${betInfo}\n\n${resultMessage}`;

    const sent = await message.reply(getLang("spin_message"));

    setTimeout(() => {
      api.editMessage(finalMessage, sent.messageID);
    }, 1500);
  }
};
