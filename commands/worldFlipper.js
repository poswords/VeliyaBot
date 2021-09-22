﻿const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const DB = require('../data')
var data = DB.getData();
const moment = require('moment-timezone');
const assetPath = 'http://veliya-bot.herokuapp.com/img/assets/';
const group = path.parse(__filename).name;
const reactionExpiry = 30000;
const normalReaction = '🙂';
const awakenReaction = '😤';
const weaponReaction = '⚔️';
const soulReaction = '📀';
const numberReactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const prefix = process.env.PREFIX || '!!';

const getInfoEmbed = (unit, flag) => {
  var footer = unit.Stance + ' - ' + unit.Role + ' - ' + unit.Gender + ' - ' + unit.Race;
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
  if (unit.Obtain) {
    footer = footer + ' - ' + unit.Obtain;
  }
  footer += '           ' + unit.DevNicknames;
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setDescription((unit.AlsoKnownAs?'**Also Known As: **'+unit.AlsoKnownAs+'\n':'')+
      '**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity
      + '\n**Leader Buff: **' + unit.LeaderBuff
      + '\n**Skill: **' + unit.Skill
      + '\n**Skill Cost: **' + unit.SkillWait)
    .addField('Ability 1', unit.Ability1, true)
    .addField('Ability 2', unit.Ability2, true)
    .addField('Ability 3', unit.Ability3, true)
    .setFooter(footer);
  if (unit.Ability4 && unit.Ability5 && unit.Ability6) {
    msg.addField('Ability 4', unit.Ability4, true)
      .addField('Ability 5', unit.Ability5, true)
      .addField('Ability 6', unit.Ability6, true)
  }
  if (flag == 'awaken') {
    msg.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_1.png')
  } else {
    msg.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_0.png')
  }
  return msg;
};

const getEquipEmbed = (unit, flag) => {
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .addField('Obtain', unit.Obtain, true)
    .setFooter(unit.DevNicknames);
  if (flag == 'soul') {
    msg.setDescription('**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity
      + '\n**Ability Soul: **' + unit.AbilitySoul)
    msg.setThumbnail(assetPath + 'item/equipment/' + unit.DevNicknames + '_soul.png')
  } else {
    msg.setDescription('**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity
      + '\n**HP: **' + unit.MaxHP + '　　**ATK: **' + unit.MaxATK
      + '\n**Weapon Skill: **' + unit.WeaponSkill)      
    msg.setThumbnail(assetPath + 'item/equipment/' + unit.DevNicknames + '.png')
  }
  return msg;
};

const getThumbnailEmbed = (unit, flag) => {
  const rarity = Array(parseInt(unit.Rarity, 10)).fill(':star:').join('');
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setDescription((unit.AlsoKnownAs?'**Also Known As: **'+unit.AlsoKnownAs+'\n':'')+'**Attribute: **' + unit.Attribute
      + '\n**Rarity: **' + rarity)
    .setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_0.png')
    .setFooter(unit.DevNicknames);
  if (flag == 'awaken') {
    msg.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_1.png')
  } else {
    msg.setThumbnail(assetPath + 'chars/' + unit.DevNicknames + '/square_0.png')
  }
  return msg;
};

const getArtEmbed = (unit, flag) => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setFooter(unit.DevNicknames);
  if (flag == 'awaken') {
    msg.setImage(assetPath + 'chars/' + unit.DevNicknames + '/full_shot_1.png')
  } else {
    msg.setImage(assetPath + 'chars/' + unit.DevNicknames + '/full_shot_0.png')
  }
  return msg;

};
const getTitleEmbed = (unit) => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName)
    .setDescription('**Condition: **' + unit.Condition);
  msg.setImage(assetPath + 'titles/' + unit.DevNicknames + '.png')
  return msg;

};

const getAnimationEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setImage(assetPath + 'chars/' + unit.DevNicknames + '/front.gif')
    .setFooter(unit.DevNicknames);
  return msg;

};

const getSpecialEmbed = unit => {
  var msg = new Discord.MessageEmbed()
    .setTitle(unit.ENName + ' ' + unit.JPName)
    .setImage(assetPath + 'chars/' + unit.DevNicknames + '/special.gif')
    .setFooter(unit.DevNicknames);
  return msg;
};

const getShortENName = longName => {
  let enName = '';
  let n = longName.split('\n');
  if (n.length >= 2) {
    enName = n[n.length - 1];
  } else {
    enName = n[0];
    const idx = enName.indexOf(']');
    if (idx > 0) {
      enName = enName.slice(idx + 1).trim();
    }
  }
  return enName;
}

const sendList = async (units, message, type) => {
  const msg = await message.channel.send('Found potential matches:\n```diff\n' + units.map((char, index) => (`${parseInt(index, 10) + 1}: ${char.ENName} ${(type == 't') ? "[" + char.JPName + "]" : ""} \n!${type} ${char.DevNicknames}`)).join('\n') + '```');
  await appendReacts(units, message, type, msg);
};

const sendFastList = async (units, message, type) => {
  let list = `${units.length} characters found:\`\`\`python\n`;
  list += units.map((char, index) => {
    let enName = getShortENName(char['ENName']);
    return `${parseInt(index, 10) + 1}: ${enName} [${char.JPName}] # ${prefix}${type} ${char.DevNicknames}`
  }).join('\n');
  list += '\`\`\`';
  const msg = await message.channel.send(list);
  await appendReacts(units, message, type, msg, 4);
};

const appendReacts = async (units, message, type, msg, max=10) => {
  const filter = (reaction, user) => {
    return numberReactions.includes(reaction.emoji.name) && user.id === message.author.id;
  };
  let num = units.length;
  if (units.length > max) num = max;
  for (let i = 0; i < num; i++) {
    await msg.react(numberReactions[i]);
  }
  const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
  collector.on('collect', r => {
    for (let i = 0; i < num; i++) {
      if (r.emoji.name === numberReactions[i]) {
        switch (type) {
          case 'c':
            sendMessage(units[i], message);
            break;
          case 'w':
            sendThumbnail(units[i], message);
            break;
          case 'e':
            sendEquip(units[i], message);
            break;
          case 'art':
            sendArt(units[i], message);
            break;
          case 'alt':
            sendAlt(units[i], message);
            break;
          case 't':
            sendTitle(units[i], message);
            break;
        }
        msg.reactions.removeAll();
      }
    }
  });
  collector.on('end', collected => msg.reactions.removeAll());
}

const sendMessage = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };
  const msg = await message.channel.send({embeds:[getInfoEmbed(unit, 'normal')]});
  await msg.react(normalReaction);
  await msg.react(awakenReaction);
  const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
  collector.on('collect', r => {
    if (r.emoji.name === normalReaction) {
      msg.edit({embeds:[getInfoEmbed(unit, 'normal')]});
    }
    if (r.emoji.name === awakenReaction) {
      msg.edit({embeds:[getInfoEmbed(unit, 'awaken')]});
    }
  });
  collector.on('end', collected => msg.reactions.removeAll());
};

const sendEquip = async (unit, message) => {
  const filter = (reaction, user) => {
    return [weaponReaction, soulReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };
  const msg = await message.channel.send({embeds:[getEquipEmbed(unit, 'icon')]});
  await msg.react(weaponReaction);
  await msg.react(soulReaction);
  const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
  collector.on('collect', r => {
    if (r.emoji.name === weaponReaction) {
      msg.edit({embeds:[getEquipEmbed(unit, 'icon')]});
    }
    if (r.emoji.name === soulReaction) {
      msg.edit({embeds:[getEquipEmbed(unit, 'soul')]});
    }
  });
  collector.on('end', collected => msg.reactions.removeAll());
};

const sendThumbnail = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };
  const msg = await message.channel.send({embeds:[getThumbnailEmbed(unit, 'normal')]});
  await msg.react(normalReaction);
  await msg.react(awakenReaction);
  const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
  collector.on('collect', r => {
    if (r.emoji.name === normalReaction) {
      msg.edit({embeds:[getThumbnailEmbed(unit, 'normal')]});
    }
    if (r.emoji.name === awakenReaction) {
      msg.edit({embeds:[getThumbnailEmbed(unit, 'awaken')]});
    }
  });
  collector.on('end', collected => msg.reactions.removeAll());
};

const sendArt = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };
  const msg = await message.channel.send({embeds:[getArtEmbed(unit, 'normal')]});
  await msg.react(normalReaction);
  await msg.react(awakenReaction);
  const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
  collector.on('collect', r => {
    if (r.emoji.name === normalReaction) {
      msg.edit({embeds:[getArtEmbed(unit, 'normal')]});
    }
    if (r.emoji.name === awakenReaction) {
      msg.edit({embeds:[getArtEmbed(unit, 'awaken')]});
    }
  });
  collector.on('end', collected => msg.reactions.removeAll());
};

const sendAlt = async (unit, message) => {
  const filter = (reaction, user) => {
    return [normalReaction, awakenReaction].includes(reaction.emoji.name) && user.id === message.author.id;
  };
  const msg = await message.channel.send({embeds:[getArtEmbed(unit, 'awaken')]});
  await msg.react(normalReaction);
  await msg.react(awakenReaction);
  const collector = msg.createReactionCollector({ filter, time: reactionExpiry});
  collector.on('collect', r => {
    if (r.emoji.name === normalReaction) {
      msg.edit({embeds:[getArtEmbed(unit, 'normal')]});
    }
    if (r.emoji.name === awakenReaction) {
      msg.edit({embeds:[getArtEmbed(unit, 'awaken')]});
    }
  });
  collector.on('end', collected => msg.reactions.removeAll());
};

const sendTitle = async (unit, message) => {
  message.channel.send({embeds:[getTitleEmbed(unit)]});
};

const searchCharByName = chara => {
  var result = data.chars.filter(function (item) {
    if (typeof item.DevNicknames !== 'undefined') {
      if (item.DevNicknames.toLowerCase() === chara) {
        return true;
      }
    }
  });
  if (result.length <= 0) {
    // Search exact match first
    result = data.chars.filter(function (item) {
      let res;
      if (res != true) {
        if (getShortENName(item['ENName']).split(' ')[0].toLowerCase() === chara) {
          res = true;
        }
        if (item['JPName'] === chara) {
          res = true;
        }
        if (typeof item.OtherCommonNames !== 'undefined') {
          const ocns = item.OtherCommonNames.split(',');
          for (let i in ocns) {
            const n = ocns[i];
            if (n.trim().toLowerCase() === chara) {
              res = true;
              break;
            }
          }
        }
      }
      return res
    });
  }
  if (result.length <= 0) {
    result = data.chars.filter(function (item) {
      let res;
      if (res != true) {
        if (item.ENName.toLowerCase().indexOf(chara) !== -1) {
          res = true;
        }
        if (item.JPName.toLowerCase().indexOf(chara) !== -1) {
          res = true;
        }
        if (typeof item.OtherCommonNames !== 'undefined') {
          if (item.OtherCommonNames.toLowerCase().indexOf(chara.toLowerCase()) !== -1) {
            res = true;
          }
        }
      }
      return res
    });
  }
  return result;
};

const searchEquipByName = chara => {
  var result = data.equips.filter(function (item) {
    if (typeof item.DevNicknames !== 'undefined') {
      if (item.DevNicknames.toLowerCase() === chara) {
        return true;
      }
    }
  });
  if (result.length <= 0) {

    result = data.equips.filter(function (item) {
      var res;
      if (res != true) {
        if (item.ENName.toLowerCase().indexOf(chara) !== -1) {
          res = true;
        }
        if (item.JPName.toLowerCase().indexOf(chara) !== -1) {
          res = true;
        }
        if (typeof item.OtherCommonNames !== 'undefined') {
          if (item.OtherCommonNames.toLowerCase().indexOf(chara) !== -1) {
            res = true;
          }
        }
      }
      return res
    });
  }
  return result;
};

const searchTitle = chara => {
  var result = data.titles.filter(function (item) {
    if (typeof item.DevNicknames !== 'undefined') {
      if (item.DevNicknames.toLowerCase() === chara) {
        return true;
      }
    }
  });
  if (result.length <= 0) {

    result = data.titles.filter(function (item) {
      var res;
      if (res != true) {
        if (item.JPName.toLowerCase().indexOf(chara.toLowerCase()) !== -1) {
          res = true;
        }
        if (item.ENName.toLowerCase().indexOf(chara.toLowerCase()) !== -1) {
          res = true;
        }
        if (item.Condition.toLowerCase().indexOf(chara.toLowerCase()) !== -1) {
          res = true;
        }
        if (typeof item.OtherCommonNames !== 'undefined') {
          if (item.OtherCommonNames.toLowerCase().indexOf(chara.toLowerCase()) !== -1) {
            res = true;
          }
        }
      }
      return res
    });
  }
  return result;
};

const filterChar = (origin, cond) => {
  let lambda = null;
  switch (cond) {
    // Elements, most used so make one/two alphabets shortcut
    case 'f':
    case 'fi':
    case 'fire':
      lambda = char => char.Attribute === 'Fire'
      break;
    case 'w':
    case 'wa':
    case 'water':
      lambda = char => char.Attribute === 'Water'
      break;
    case 'i':
    case 'wi':
    case 'wind':
      lambda = char => char.Attribute === 'Wind'
      break;
    case 't':
    case 'th':
    case 'thunder':
      lambda = char => char.Attribute === 'Thunder'
      break;
    case 'l':
    case 'li':
    case 'light':
      lambda = char => char.Attribute === 'Light'
      break;
    case 'd':
    case 'da':
    case 'dark':
      lambda = char => char.Attribute === 'Dark'
      break;
    // Race
    case 'human':
    case 'sprite':
    case 'beast':
    case 'mecha':
    case 'dragon':
    case 'undead':
    case 'youkai':
    case 'plant':
    case 'demon':
    case 'aquatic':
      lambda = char => char['Race'].toLowerCase().indexOf(cond) >= 0;
      break;
    // PF type
    case 'sword':
    case 'bow':
    case 'fist':
    case 'support':
    case 'special':
      lambda = char => char['Role'].toLowerCase() === cond;
      break;
    // Gender
    case 'male':
    case 'female':
    case 'unknown':
    case 'lily':
      lambda = char => char['Gender'].toLowerCase() === cond;
      break;
  }
  // Skill wait
  if (/^s[wc](>|<|==|>=|<=)\d+$/.test(cond)) {
    lambda = char => eval(char['SkillWait'] + cond.slice(2));
  }
  // Rarity
  const r = cond.match(/^(\d+)\*$/);
  if (r != null) {
    lambda = char => {
      for (let i = 0; i < r[1].length; i++) {
        if (parseInt(char['Rarity']) === parseInt(r[1].charAt(i))) {
          return true;
        }
      }
      return false;
    }
  }

  if (lambda == null) {
    return null;
  }

  return origin.filter(function (char) {
    return lambda(char);
  });
};

const filterCharByText = (origin, text, options) => {
  return origin.filter(function (char) {
    const exclude = !!options['exclude'];
    const fields = options['fields'];
    if (fields.length === 0) {
      fields.push(...['LeaderBuff', 'Skill']);
      for (let i = 1; i <= 6; i++) {
        fields.push('Ability' + i);
      }
    }
    if (options.regexp) {
      for (let f in fields) {
        const field = char[fields[f]];
        if (new RegExp(text).test(field.toLowerCase())) {
          return !exclude;
        }
      }
    } else {
      for (let f in fields) {
        const field = char[fields[f]];
        if (field.toLowerCase().indexOf(text) >= 0) {
          return !exclude;
        }
      }
    }
    return exclude;
  });
};

const extractTextFilterOption = (options, arg) => {
  switch (arg) {
    case 'leader':
    case 'lb':
      options['fields'].push('LeaderBuff');
      return true;
    case 'skill':
    case 's':
      options['fields'].push('Skill');
      return true;
    case 'ability':
    case 'abi':
    case 'ab':
    case 'a':
      for (let i = 1; i <= 6; i++) {
        options['fields'].push('Ability' + i);
      }
      return true;
    case 'unison':
    case 'u':
    case 'sub':
      options['fields'].push('Skill');
      for (let i = 1; i <= 6; i++) {
        if (i === 3) continue;
        options['fields'].push('Ability' + i);
      }
      return true;
    case 'exclude':
    case 'ex':
    case 'not':
      options['exclude'] = true;
      return true;
    case 'regexp':
    case 're':
    case 'r':
      options['regexp'] = true;
      return true;
    case 'reset':
      options['fields'] = [];
      delete options['exclude'];
      delete options['regexp'];
      return true;
  }
  const r = arg.match(/^ab?(\d+)$/);
  if (r != null) {
    for (let i = 0; i < r[1].length; i++) {
      options['fields'].push('Ability' + r[1].charAt(i));
    }
    return true;
  }
  return false;
};

const guide = {
  name: 'guide',
  group,
  aliases: ['g', 'beginner'],
  description: 'Links LilyCat\'s Beginner Progression Guide.',
  execute(message) {
    const guideLink = 'https://docs.google.com/document/d/1gParEsz_GsETHyjunJ9mBz7tgKfkUOmueopR4UUp274';
    return message.channel.send(`The Beginner Progression Guide can be found here:\n${guideLink}`);
  },
};

const tls = {
  name: 'translations',
  group,
  aliases: ['tl', 'translation'],
  description: "Link to Eliya Bot's translation webapp",
  execute(message) {
    const tlDocLink = 'http://veliya-bot.herokuapp.com/list';
    return message.channel.send(`The translation webapp can be found here:\n${tlDocLink}`);
  },
};

function getTimeUntil(diff) {
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);
  const hours = Math.floor(diff / 1000 / 60 / 60 - (days * 24));
  const minutes = Math.floor(diff / 1000 / 60 % 60);
  var timeUntil = '';
  if (days > 0) {
    timeUntil += days + 'd';
  }
  if (hours > 0 || days > 0) {
    timeUntil += hours + 'h';
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    timeUntil += minutes + 'm';
  }
  return timeUntil;
}

const event = {
  name: 'event',
  group,
  aliases: ['ev', 'events'],
  description: 'Lists ongoing/upcoming events.',
  execute(message) {
    var ongoingList = '';
    var upcomingList = '';
    for (i = 0; i < data.events.length; i++) {
      const event = data.events[i];
      var aLength = 40 - event.ENName.length;
      var start = moment.tz(event.Start, "Asia/Tokyo");
      var end = moment.tz(event.End, "Asia/Tokyo");
      var now = moment.tz("Asia/Tokyo");

      if (end.isAfter(now)) {

        if (aLength < 0) {
          aLength = 0
        }
        ;
        if (start.isBefore(now)) {
          timeUntil = getTimeUntil(end.format("x") - now.format("x"));
          if (event.Type != "Banner") {
            ongoingList += event.ENName + '\n+ End : ' + event.End + ' (' + timeUntil + ")\n";
          }
        } else {
          timeUntil = getTimeUntil(start.format("x") - now.format("x"));
          if (event.Type != "Banner") {
            upcomingList += event.ENName + '\n+ Start : ' + event.Start + ' (' + timeUntil + ")\n";
          }
        }
      }
    }
    var msg = new Discord.MessageEmbed();

    if (ongoingList.length > 0) {
      msg.addFields({name: "Ongoing Events", value: "```diff\n" + ongoingList + "```"});
    } else {
      msg.addFields({name: "Ongoing Events", value: "```diff\nNo ongoing event```"})
    }
    if (upcomingList.length > 0) {
      msg.addFields({name: "Upcoming Events", value: "```diff\n" + upcomingList + "```"})
    } else {
      msg.addFields({name: "Upcoming Events", value: "```diff\nNo upcoming event```"})
    }

    return message.channel.send({embeds:[msg]});
  },
};
const gacha = {
  name: 'gacha',
  group,
  aliases: ['b', 'bn', 'banner', 'banners'],
  description: 'Lists ongoing/upcoming pick-up banner.',
  execute(message) {
    var ongoingBannerList = '';
    var upcomingBannerList = '';
    for (i = 0; i < data.events.length; i++) {
      const event = data.events[i];
      var aLength = 40 - event.ENName.length;
      var start = moment.tz(event.Start, "Asia/Tokyo");
      var end = moment.tz(event.End, "Asia/Tokyo");
      var now = moment.tz("Asia/Tokyo");

      if (end.isAfter(now)) {

        if (aLength < 0) {
          aLength = 0
        }
        ;
        if (start.isBefore(now)) {
          timeUntil = getTimeUntil(end.format("x") - now.format("x"));
          if (event.Type == "Banner") {
            ongoingBannerList += event.ENName + '\n+ End : ' + event.End + ' (' + timeUntil + ")\n";
          }
        } else {
          timeUntil = getTimeUntil(start.format("x") - now.format("x"));
          if (event.Type == "Banner") {
            upcomingBannerList += event.ENName + '\n+ Start : ' + event.Start + ' (' + timeUntil + ")\n";
          }
        }
      }
    }
    var msg = new Discord.MessageEmbed();

    if (ongoingBannerList.length > 0) {
      msg.addFields({name: "Ongoing Banners", value: "```diff\n" + ongoingBannerList + "```"});
    } else {
      msg.addFields({name: "Ongoing Banners", value: "```diff\nNo ongoing pick-up banner```"})
    }
    if (upcomingBannerList.length > 0) {
      msg.addFields({name: "Upcoming Banners", value: "```diff\n" + upcomingBannerList + "```"})
    } else {
      msg.addFields({name: "Upcoming Banners", value: "```diff\nNo upcoming pick-up banner```"})
    }

    return message.channel.send({embeds:[msg]});
  },
};
const tracker = {
  name: 'tracker',
  group,
  aliases: ['tr', 'track'],
  description: 'Links Collection Tracker.',
  execute(message) {
    const tlDocLink = 'http://veliya-bot.herokuapp.com/';
    return message.channel.send(`The collection tracker can be found below. Fill up both your units and weapons here for teambuiding advices: \n${tlDocLink}`);
  },
};
const character = {
  name: 'character',
  group,
  args: true,
  usage: '<chara name>',
  aliases: ['c', 'char'],
  description: 'Lists information about the given character.',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }
    if (chara == 'malte') {
      sendEquip(searchEquipByName(chara)[0], message);
    } else {

      var arrFound = searchCharByName(chara);

      if (arrFound.length === 0) {
        return message.channel.send('No character found!');
      }
      if (arrFound.length > 30) {
        return message.channel.send(arrFound.length + ' found! Please narrow your search');
      }
      if (arrFound.length === 1) {
        sendMessage(arrFound[0], message);
      } else {
        sendList(arrFound, message, 'c');
      }
    }
  },
};

const equipment = {
  name: 'equipment',
  group,
  args: true,
  usage: '<equipment name>',
  aliases: ['e', 'equip'],
  description: 'Lists information about the given equipment.',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    } else {
      var arrFound = searchEquipByName(chara);

      if (arrFound.length === 0) {
        return message.channel.send('No equipment found!');
      }
      if (arrFound.length > 30) {
        return message.channel.send(arrFound.length + ' found! Please narrow your search');
      }
      if (arrFound.length === 1) {
        sendEquip(arrFound[0], message);
      } else {
        sendList(arrFound, message, 'e');
      }
    }
  },
};

const race = {
  name: 'race',
  group,
  args: true,
  usage: '<chara race>',
  aliases: ['r'],
  description: 'Lists characters with the given race.',
  async execute(message, args) {
    const race = args.length ? args.join(' ').toLowerCase() : null;
    if (race.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }

    var arrFound = data.chars.filter(function (item) {
      return item.Race.toLowerCase().indexOf(race) !== -1;
    });

    if (arrFound.length === 0) {
      return message.channel.send('No character found!');
    }
    if (arrFound.length > 40) {
      return message.channel.send(arrFound.length + ' found! Please narrow your search');
    }
    if (arrFound.length === 1) {
      sendMessage(arrFound[0], message);
    } else {
      sendList(arrFound, message, 'c');
    }

  },
};

const whois = {
  name: 'whois',
  group,
  args: true,
  usage: '<chara thumbnail>',
  aliases: ['w', 'tn'],
  description: 'Show thumbnail of the character',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;

    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }
    if (chara == 'malte') {
      sendEquip(searchEquipByName(chara)[0], message);
    } else {
      var arrFound = searchCharByName(chara);

      if (arrFound.length === 0) {
        return message.channel.send('No character found!');
      }
      if (arrFound.length > 30) {
        return message.channel.send(arrFound.length + ' found! Please narrow your search');
      }
      if (arrFound.length === 1) {
        sendThumbnail(arrFound[0], message);
      } else {
        sendList(arrFound, message, 'w');
      }
    }
  },
};

const art = {
  name: 'art',
  group,
  args: true,
  usage: '<chara art>',
  aliases: ['a'],
  description: 'Show full art of the character',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }
    var arrFound = searchCharByName(chara);

    if (arrFound.length === 0) {
      return message.channel.send('No character found!');
    }
    if (arrFound.length > 30) {
      return message.channel.send(arrFound.length + ' found! Please narrow your search');
    }
    if (arrFound.length === 1) {
      sendArt(arrFound[0], message);
    } else {
      sendList(arrFound, message, 'art');
    }
  },
};
const alt = {
  name: 'alt',
  group,
  args: true,
  usage: '<chara alt>',
  aliases: ['al'],
  description: 'Show alternate art of the character',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }
    var arrFound = searchCharByName(chara);

    if (arrFound.length === 0) {
      return message.channel.send('No character found!');
    }
    if (arrFound.length > 30) {
      return message.channel.send(arrFound.length + ' found! Please narrow your search');
    }
    if (arrFound.length === 1) {
      sendAlt(arrFound[0], message);
    } else {
      sendList(arrFound, message, 'alt');
    }
  },
};

const title = {
  name: 'title',
  group,
  args: true,
  usage: '<title>',
  aliases: ['t'],
  description: 'Show title',
  async execute(message, args) {
    const chara = args.length ? args.join(' ').toLowerCase() : null;
    if (chara.length < 2) {
      return message.channel.send('Search too short please have a minimum of 2 letters!');
    }
    var arrFound = searchTitle(chara);

    if (arrFound.length === 0) {
      return message.channel.send('No character found!');
    }
    if (arrFound.length > 30) {
      return message.channel.send(arrFound.length + ' found! Please narrow your search');
    }
    if (arrFound.length === 1) {
      sendTitle(arrFound[0], message);
    } else {
      sendList(arrFound, message, 't');
    }
  },
};
const update = {
  name: 'update',
  group,
  usage: '<update>',
  description: 'Sync spreadsheet data',
  execute(message, args) {
    data = DB.getData();
    const axios = require('axios');
    axios.post('http://veliya-bot.herokuapp.com/update', {})
      .then((res) => {

      })
      .catch((error) => {
        console.error(error)
      })
    return message.channel.send('Database updated!');
  },
}

const filterCharacter = {
  name: 'filter-character',
  group,
  args: true,
  usage: '<filter conditions>',
  aliases: ['f', 'fc'],
  description: 'Filter characters by conditions',
  async execute(message, args) {
    let filtered = data.chars;
    let textFilterOptions = {
      fields: []
    };
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (extractTextFilterOption(textFilterOptions, arg)) {
        continue;
      }
      switch (arg) {
        case '-t':
        case '--text':
          if (i === args.length - 1) {
            return message.channel.send("Not enough argument for -t text search!");
          }
          i++;
          filtered = filterCharByText(filtered, args[i].toLowerCase(), textFilterOptions);
          break;
        default:
          const result = filterChar(filtered, args[i].toLowerCase());
          if (result == null) {
            filtered = filterCharByText(filtered, args[i].toLowerCase(), textFilterOptions);
          } else {
            filtered = result;
          }
          break;
      }
    }

    if (filtered.length === 0) {
      return message.channel.send('No character found!');
    }
    if (filtered.length > 30) {
      return message.channel.send(filtered.length + ' found! Please narrow your search');
    }
    if (filtered.length === 1) {
      await sendMessage(filtered[0], message);
    } else {
      await sendFastList(filtered, message, 'c');
    }
  },
};


module.exports = [guide, tls, tracker, event, gacha, character, equipment,
  race, whois, art, alt, title, update, filterCharacter];