var mongoose = require("mongoose");

require("dotenv").config();
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
exports.mongoose = mongoose;

var Schema = mongoose.Schema;

// User schema
let userSchema = new Schema({
  name: { type: String },
  username: { type: String },
  email: { type: String },
  password: { type: String },
  profilepic: { type: String },
  gender: { type: String },
  age: { type: String },
  biodata: { type: String },
  location: { type: String },
  website: { type: String },
  role: { type: String, default: "user" },
  popular: { type: Boolean, default: false },
  status: { type: Number, default: 1 },
  notification: { type: String, default: "public" }, //(To receive push notification or not)
  appTheme: { type: Number }, //(To set theme in app based on view number)
  nsfw: { type: Boolean, default: false },
  logintype: { type: String },
  quickbloxid: { type: String },
  linkemailuserid: { type: String },
  sociallogin: {
    facebook: {
      facebookid: String,
      name: String,
      email: String,
      profilepic: String,
      gender: String,
      dob: String
    },
    twitter: {
      twitterid: String,
      name: String,
      profilepic: String,
      gender: String,
      dob: String
    }
  },
  devices: [
    {
      devicetoken: { type: String },
      devicetype: { type: String },
      version: String,
      lastLoginDevice: { type: String }
    }
  ],
  likes: [{ tweakid: String, created: { type: Date, default: Date.now } }],
  appversion: [{ type: String }],
  followers: [{ type: String }],
  following: [{ type: String }],
  searchhistory: [
    {
      searchstring: { type: String },
      searchType: { type: String },
      created: { type: Date, default: Date.now }
    }
  ],
  //SavedSearch: [{ searchstring: { type: String } }],  //doubt
  isbloopituser: { type: Boolean, default: false },
  likesCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  tweakCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  bombedCount: { type: Number, default: 0 },
  flaggedcount: { type: Number, default: 0 },
  lastlogin: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now },
  lastupdated: { type: Date, default: Date.now },
  webCreateVisited: { type: Boolean, default: false },
  isFirstLogin: { type: Boolean, default: false },
  isStaffDelete: { type: Boolean, default: false }
});
// UsersSchema.set("toJSON", { getters: true });
exports.User = mongoose.model("User", userSchema);

// Web schema
let WebSchema = new Schema({
  title: { type: String },
  videourl: { type: String },
  imageurl: { type: String },
  created: { type: Date, default: Date.now }
});
WebSchema.set("toJSON", { getters: true });
exports.Web = mongoose.model("Web", WebSchema);

// Tweak schema
let TweakSchema = new Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String },
  description: { type: String },
  category: [
    { categoryid: { type: mongoose.Schema.Types.ObjectId, ref: "Category" } }
  ],
  image: { type: String },
  videourl: { type: String },
  starttime: { type: String },
  endtime: { type: String },
  tweakurl: { type: String },
  tweakimage: { type: String },
  status: { type: Number, default: 1 },
  publicScope: { type: Boolean, default: true },
  savePermission: { type: Boolean, default: true },
  nsfw: { type: Boolean, default: false },
  staffpick: { type: Boolean, default: false },
  help: { type: Boolean, default: false },
  usertag: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      created: { type: Date, default: Date.now }
    }
  ],
  tags: [{ tagName: String, created: { type: Date, default: Date.now } }],
  likes: [{ type: String }],
  bombed: [{ type: String }],
  flagged: [
    {
      user: { type: String },
      tweak: { type: String },
      flaggedType: { type: String },
      created: { type: Date, default: Date.now }
    }
  ],
  sharecount: { type: Number, default: 0 },
  shareDetails: [
    {
      user: { type: String },
      shareType: { type: String },
      created: { type: Date, default: Date.now }
    }
  ],
  viewsCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  bombedCount: { type: Number, default: 0 },
  viewers: [{ type: String }],
  commentsCount: { type: Number, default: 0 },
  isbadtweak: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
  lastupdated: { type: Date, default: Date.now },
  bannerText: { type: String },
  bannerColor: { type: String },
  bannerXposition: { type: String },
  bannerYposition: { type: String },
  shareurl: { type: String },
  totalTweaks: { type: Number }
});
TweakSchema.set("toJSON", { getters: true });
exports.Tweak = mongoose.model("Tweak", TweakSchema);

// Activity schema
let ActivitySchema = new Schema({
  tweakid: { type: Schema.Types.ObjectId, ref: "Tweak" },
  userid: { type: Schema.Types.ObjectId, ref: "User" },
  shareto: { type: String },
  status: { type: Number, required: true },
  created: { type: Date, required: true, default: Date.now }
});

ActivitySchema.set("toJSON", { getters: true });
exports.Activity = mongoose.model("Activity", ActivitySchema);

// Admin-notification schema
let AdminNotificationSchema = new Schema({
  users: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      status: { type: String, default: "Pending" },
      errorMessage: { type: String },
      devicetype: { type: String },
      sentTime: { type: Date }
    }
  ],
  notificationText: { type: String },
  notificationUserType: { type: String },
  notificationType: { type: String },
  scheduledTime: { type: Date },
  isDraft: { type: Boolean, default: false },
  status: { type: String, default: "Pending" },
  created: { type: Date, default: Date.now }
});
AdminNotificationSchema.set("toJSON", { getters: true });
exports.AdminNotification = mongoose.model(
  "AdminNotification",
  AdminNotificationSchema
);

// Category schema
let CategorySchema = new Schema({
  categoryname: String,
  count: { type: Number, default: 0 },
  categoryLikes: { type: Number, default: 0 },
  categoryDislikes: { type: Number, default: 0 },
  created: { type: Date, default: Date.now }
});
CategorySchema.set("toJSON", { getters: true });
exports.Category = mongoose.model("Category", CategorySchema);

// Clipper schema
let clipperSchema = new Schema({
  videoUrl: { type: String },
  imageUrl: { type: String },
  created: { type: Date, default: Date.now }
});
clipperSchema.set("toJSON", { getters: true });
exports.Clipper = mongoose.model("Clipper", clipperSchema);

// Comment schema
let CommentSchema = new Schema({
  tweakid: { type: Schema.Types.ObjectId, ref: "Tweak" },
  commenttype: { type: String },
  commentUrl: { type: String }, // video url
  comment: { type: String },
  userid: { type: Schema.Types.ObjectId, ref: "User" },
  created: { type: Date, default: Date.now }
});
CommentSchema.set("toJSON", { getters: true });
exports.Comment = mongoose.model("Comment", CommentSchema);

// Custom message schema
let CustomMessageSchema = new Schema({
  query: { type: String },
  message: { type: String }
});
CustomMessageSchema.set("toJSON", { getters: true });
exports.CustomMessage = mongoose.model("CustomMessage", CustomMessageSchema);

// Featured tweaks schema
let FeaturedTweaksSchema = new Schema({
  tweakid: { type: mongoose.Schema.Types.ObjectId, ref: "Tweak" },
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isDelete: { type: Boolean, default: false },
  created: { type: Date, required: true, default: Date.now }
});
FeaturedTweaksSchema.set("toJSON", { getters: true });
exports.FeaturedTweak = mongoose.model("FeaturedTweak", FeaturedTweaksSchema);

// Feedback schema
let FeedBackSchema = new Schema({
  userid: { type: Schema.Types.ObjectId, ref: "User" },
  username: { type: String },
  email: { type: String },
  subject: { type: String },
  message: { type: String },
  created: { type: Date, default: Date.now }
});
FeedBackSchema.set("toJSON", { getters: true });
exports.FeedBack = mongoose.model("FeedBack", FeedBackSchema);

// Key schema
let KeysSchema = new Schema({
  key: { type: String },
  count: { type: Number, default: 0 },
  updated: { type: Date, default: Date.now }
});
KeysSchema.set("toJSON", { getters: true });
exports.Keys = mongoose.model("Keys", KeysSchema);

// Notification schema
let NotificationSchema = new Schema({
  userid: { type: Schema.Types.ObjectId, ref: "User" },
  alert: { type: String },
  fromuserid: { type: Schema.Types.ObjectId, ref: "User" },
  commentid: { type: String },
  tweakid: { type: Schema.Types.ObjectId, ref: "Bloop" },
  isread: { type: Boolean, default: false },
  type: { type: String },
  created: { type: Date, default: Date.now }
});
NotificationSchema.set("toJSON", { getters: true });
exports.Notification = mongoose.model("Notification", NotificationSchema);

// Template message schema
let TemplateMessagesSchema = new Schema({
  title: { type: String },
  templateText: { type: String },
  created: { type: Date, default: Date.now }
});
TemplateMessagesSchema.set("toJSON", { getters: true });
exports.TemplateMessages = mongoose.model(
  "TemplateMessages",
  TemplateMessagesSchema
);
