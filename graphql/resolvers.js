var gql = require("graphql");
var db = require("../db");

var {
  User,
  Web,
  Tweak,
  Activity,
  AdminNotification,
  Category,
  Clipper,
  Comment,
  CustomMessage,
  FeaturedTweak,
  FeedBack,
  Keys,
  Notification,
  TemplateMessages
} = require("../db.js");

const resolvers = {
  Query: {
    //all tweaks
    allTweaks: () => {
      return new Promise((resolve, reject) => {
        db.Tweak.find({}, (err, tweaks) => {
          if (err) reject(err);
          resolve(tweaks);
        });
      });
    },
    // all users
    allUsers: () => {
      return new Promise((resolve, reject) => {
        db.User.find({}, (err, users) => {
          if (err) reject(err);
          resolve(users);
        });
      });
    },
    // all activities
    allActivities: () => {
      return new Promise((resolve, reject) => {
        db.Activity.find({}, (err, activities) => {
          if (err) reject(err);
          resolve(activities);
        });
      });
    },
    // all admin notifications
    allAdminNotifications: () => {
      return new Promise((resolve, reject) => {
        db.AdminNotification.find({}, (err, adminnotifications) => {
          if (err) reject(err);
          resolve(adminnotifications);
        });
      });
    },
    // all categories
    allCategories: () => {
      return new Promise((resolve, reject) => {
        db.Category.find({}, (err, categories) => {
          if (err) reject(err);
          resolve(categories);
        });
      });
    },
    // all comments
    allComments: () => {
      return new Promise((resolve, reject) => {
        db.Comment.find({}, (err, comments) => {
          if (err) reject(err);
          resolve(comments);
        });
      });
    },
    // all feedbacks
    allFeedBacks: () => {
      return new Promise((resolve, reject) => {
        db.FeedBack.find({}, (err, feedbacks) => {
          if (err) reject(err);
          resolve(feedbacks);
        });
      });
    },
    // all notifications
    allNotifications: () => {
      return new Promise((resolve, reject) => {
        db.Notification.find({}, (err, notifications) => {
          if (err) reject(err);
          resolve(notifications);
        });
      });
    },
    getAllTweaksByCategory: (root, { start, categoryid }) => {
      return new Promise((resolve, reject) => {
        if (categoryid == null || categoryid == "") {
          reject("categoryid is required");
        } else {
          var limit = 20;
          Category.findOne({ _id: categoryid }).exec((err, res) => {
            if (res != null) {
              Tweak.find({ "category.categoryid": categoryid })
                .count()
                .exec((err, tweaksCountByCat) => {
                  Tweak.find({ "category.categoryid": categoryid })
                    .sort({ created: -1 })
                    .limit(limit)
                    .skip(start)
                    .exec((err, res) => {
                      var data = [];
                      if (err) reject(err);
                      else {
                        var len = res.length;

                        _.each(res, function(data1) {
                          User.findOne({ _id: data1.userid }).exec(
                            (err, result) => {
                              if (result != null) {
                                data1.username = result.username;
                                data1.profilepic = result.profilepic;
                              }

                              data1.views = data1.viewsCount;
                              var viewCount = data1.viewsCount / 1000;
                              if (viewCount >= 1) {
                                data1.views =
                                  parseFloat(viewCount).toFixed(1) + "k";
                              }

                              if (data1.followerCount / 1000 >= 1) {
                                data1.followerCount =
                                  parseFloat(
                                    data1.followerCount / 1000
                                  ).toFixed(1) + "k";
                              }

                              if (data1.likecount / 1000 >= 1) {
                                data1.likecount =
                                  parseFloat(data1.likecount / 1000).toFixed(
                                    1
                                  ) + "k";
                              }

                              if (data1.bombedcount / 1000 >= 1) {
                                data1.bombedcount =
                                  parseFloat(data1.bombedcount / 1000).toFixed(
                                    1
                                  ) + "k";
                              }

                              data.push(data1);
                              len--;
                              if (len == 0) {
                                var sort_by = function(field, reverse, primer) {
                                  var key = primer
                                    ? function(x) {
                                        return primer(x[field]);
                                      }
                                    : function(x) {
                                        return x[field];
                                      };

                                  reverse = !reverse ? 1 : -1;

                                  return function(a, b) {
                                    return (
                                      (a = key(a)),
                                      (b = key(b)),
                                      reverse * ((a > b) - (b > a))
                                    );
                                  };
                                };
                                data.sort(
                                  sort_by("created", true, function(a) {
                                    return a;
                                  })
                                );
                                data[0].count = tweaksCountByCat;
                                resolve(data);
                              }
                            }
                          );
                        });
                        if (len == 0) resolve(res);
                      }
                    });
                });
            } else reject("Category does not exist");
          });
        }
      });
    },
    getTweaks: (root, { userid, categoryType, start, categoryid }) => {
      return new Promise((resolve, reject) => {
        var limit = 25;
        if (categoryType == "New") {
          Tweak.find({
            $and: [
              { $or: [{ publicScope: 1 }, { userid: userid }] },
              { bombed: { $ne: userid } },
              { isbadtweak: { $ne: 1 } }
            ]
          })
            .sort({ created: -1 })
            .limit(limit)
            .skip(start)
            .exec((err, res) => {
              var data = [];
              if (err) reject(err);
              else {
                var len = res.length;

                _.each(res, function(data1) {
                  User.findOne({ _id: data1.userid }).exec((err, result) => {
                    Comment.find({
                      $and: [{ tweakid: data1._id }, { userid: userid }]
                    })
                      .count()
                      .exec((err, count) => {
                        Tweak.find({ userid: result._id })
                          .count()
                          .exec((err, tweakCount) => {
                            data1.tweakCount = tweakCount;
                            if (data1.tweakCount / 1000 >= 1) {
                              data1.tweakCount =
                                parseFloat(data1.tweakCount / 1000).toFixed(1) +
                                "k";
                            }

                            data1.views = data1.viewsCount;
                            var viewCount = data1.viewsCount / 1000;
                            if (viewCount >= 1) {
                              data1.views =
                                parseFloat(viewCount).toFixed(1) + "k";
                            }

                            data1.commentCount = data1.commentsCount;
                            var commentCount = data1.commentsCount / 1000;
                            if (commentCount >= 1) {
                              data1.commentCount =
                                parseFloat(commentCount).toFixed(1) + "k";
                            }

                            var index = data1.likes.indexOf(userid);
                            if (index > -1) data1.isliked = 1;
                            else data1.isliked = 0;

                            var index = data1.viewers.indexOf(userid);
                            if (index > -1) data1.isviewed = 1;
                            else data1.isviewed = 0;

                            data1.followerCount = result.followers.length;
                            if (data1.followerCount / 1000 >= 1) {
                              data1.followerCount =
                                parseFloat(data1.followerCount / 1000).toFixed(
                                  1
                                ) + "k";
                            }

                            var index = result.followers.indexOf(userid);
                            if (index > -1) data1.isfollowing = 1;
                            else data1.isfollowing = 0;

                            if (count > 0) data1.iscommented = 1;
                            else data1.iscommented = 0;
                            if (result != null) {
                              data1.username = result.username;
                              data1.profilepic = result.profilepic;
                            }

                            var index = data1.bombed.indexOf(userid);
                            if (index > -1) data1.isbombed = 1;
                            else data1.isbombed = 0;

                            data1.likecount = data1.likes.length;
                            if (data1.likecount / 1000 >= 1) {
                              data1.likecount =
                                parseFloat(data1.likecount / 1000).toFixed(1) +
                                "k";
                            }

                            data1.bombedcount = data1.bombed.length;
                            if (data1.bombedcount / 1000 >= 1) {
                              data1.bombedcount =
                                parseFloat(data1.bombedcount / 1000).toFixed(
                                  1
                                ) + "k";
                            }

                            data.push(data1);
                            len--;
                            if (len == 0) {
                              var sort_by = function(field, reverse, primer) {
                                var key = primer
                                  ? function(x) {
                                      return primer(x[field]);
                                    }
                                  : function(x) {
                                      return x[field];
                                    };

                                reverse = !reverse ? 1 : -1;

                                return function(a, b) {
                                  return (
                                    (a = key(a)),
                                    (b = key(b)),
                                    reverse * ((a > b) - (b > a))
                                  );
                                };
                              };
                              data.sort(
                                sort_by("created", true, function(a) {
                                  return a;
                                })
                              );
                              resolve(data);
                            }
                          });
                      });
                  });
                });
                if (len == 0) resolve(res);
              }
            });
        } else if (categoryType == "MyFeed") {
          User.findOne({ _id: userid }).exec((err, res1) => {
            if (res1 == null) {
              reject("User does not exist");
            } else {
              var array = res1.following;
              //console.log("res1 following"+JSON.stringify(array))
              array.push(userid);
              Tweak.find({
                $and: [
                  { likes: { $in: array } },
                  { $or: [{ publicScope: 1 }, { userid: userid }] },
                  { bombed: { $ne: userid } },
                  { isbadtweak: { $ne: 1 } }
                ]
              })
                .sort({ created: -1 })
                .limit(limit)
                .skip(start)
                .exec((err, res) => {
                  var data = [];
                  if (err) reject(err);
                  else {
                    var len = res.length;

                    _.each(res, function(data1) {
                      User.findOne({ _id: data1.userid }).exec(
                        (err, result) => {
                          if (result) {
                            Comment.find({
                              $and: [{ tweakid: data1._id }, { userid: userid }]
                            })
                              .count()
                              .exec((err, count) => {
                                Tweak.find({ userid: result._id })
                                  .count()
                                  .exec((err, tweakCount) => {
                                    data1.tweakCount = tweakCount;
                                    if (data1.tweakCount / 1000 >= 1) {
                                      data1.tweakCount =
                                        parseFloat(
                                          data1.tweakCount / 1000
                                        ).toFixed(1) + "k";
                                    }

                                    data1.views = data1.viewsCount;
                                    var viewCount = data1.viewsCount / 1000;
                                    if (viewCount >= 1) {
                                      data1.views =
                                        parseFloat(viewCount).toFixed(1) + "k";
                                    }

                                    data1.commentCount = data1.commentsCount;
                                    var commentCount =
                                      data1.commentsCount / 1000;
                                    if (commentCount >= 1) {
                                      data1.commentCount =
                                        parseFloat(commentCount).toFixed(1) +
                                        "k";
                                    }

                                    var index = data1.likes.indexOf(userid);
                                    if (index > -1) data1.isliked = 1;
                                    else data1.isliked = 0;

                                    var index = data1.viewers.indexOf(userid);
                                    if (index > -1) data1.isviewed = 1;
                                    else data1.isviewed = 0;

                                    data1.followerCount =
                                      result.followers.length;
                                    if (data1.followerCount / 1000 >= 1) {
                                      data1.followerCount =
                                        parseFloat(
                                          data1.followerCount / 1000
                                        ).toFixed(1) + "k";
                                    }

                                    var index = result.followers.indexOf(
                                      userid
                                    );
                                    if (index > -1) data1.isfollowing = 1;
                                    else data1.isfollowing = 0;

                                    if (count > 0) data1.iscommented = 1;
                                    else data1.iscommented = 0;

                                    if (result != null) {
                                      data1.username = result.username;
                                      data1.profilepic = result.profilepic;
                                    }

                                    var index = data1.likes.indexOf(userid);
                                    if (index > -1) data1.isliked = 1;
                                    else data1.isliked = 0;

                                    var index = data1.bombed.indexOf(userid);
                                    if (index > -1) data1.isbombed = 1;
                                    else data1.isbombed = 0;

                                    data1.likecount = data1.likes.length;
                                    if (data1.likecount / 1000 >= 1) {
                                      data1.likecount =
                                        parseFloat(
                                          data1.likecount / 1000
                                        ).toFixed(1) + "k";
                                    }

                                    data1.bombedcount = data1.bombed.length;
                                    if (data1.bombedcount / 1000 >= 1) {
                                      data1.bombedcount =
                                        parseFloat(
                                          data1.bombedcount / 1000
                                        ).toFixed(1) + "k";
                                    }

                                    data.push(data1);
                                    len--;
                                    if (len == 0) {
                                      var sort_by = function(
                                        field,
                                        reverse,
                                        primer
                                      ) {
                                        var key = primer
                                          ? function(x) {
                                              return primer(x[field]);
                                            }
                                          : function(x) {
                                              return x[field];
                                            };

                                        reverse = !reverse ? 1 : -1;

                                        return function(a, b) {
                                          return (
                                            (a = key(a)),
                                            (b = key(b)),
                                            reverse * ((a > b) - (b > a))
                                          );
                                        };
                                      };
                                      data.sort(
                                        sort_by("created", true, function(a) {
                                          return a;
                                        })
                                      );
                                      resolve(data);
                                    }
                                  });
                              });
                          } else {
                            console.log("err..");
                          }
                        }
                      );
                    });
                    if (len == 0) resolve(res);
                  }
                });
            }
          });
        } else if (categoryType == "StaffPicks") {
          Tweak.find({
            $and: [
              { staffpick: 1 },
              { bombed: { $ne: userid } },
              { $or: [{ publicScope: 1 }, { userid: userid }] },
              { isbadtweak: { $ne: 1 } }
            ]
          })
            .sort({ viewsCount: -1 })
            .limit(limit)
            .skip(start)
            .exec((err, res) => {
              var data = [];
              if (err) reject(err);
              else {
                var len = res.length;

                _.each(res, function(data1) {
                  User.findOne({ _id: data1.userid }).exec((err, result) => {
                    Comment.find({
                      $and: [{ tweakid: data1._id }, { userid: userid }]
                    })
                      .count()
                      .exec((err, count) => {
                        Tweak.find({ userid: result._id })
                          .count()
                          .exec((err, tweakCount) => {
                            data1.tweakCount = tweakCount;
                            var index = data1.likes.indexOf(userid);
                            if (index > -1) data1.isliked = 1;
                            else data1.isliked = 0;

                            var index = data1.viewers.indexOf(userid);
                            if (index > -1) data1.isviewed = 1;
                            else data1.isviewed = 0;

                            data1.followerCount = result.followers.length;

                            var index = result.followers.indexOf(userid);
                            if (index > -1) data1.isfollowing = 1;
                            else data1.isfollowing = 0;

                            if (count > 0) data1.iscommented = 1;
                            else data1.iscommented = 0;

                            if (result != null) {
                              data1.username = result.username;
                              data1.profilepic = result.profilepic;
                            }

                            var index = data1.likes.indexOf(userid);
                            if (index > -1) data1.isliked = 1;
                            else data1.isliked = 0;

                            var index = data1.bombed.indexOf(userid);
                            if (index > -1) data1.isbombed = 1;
                            else data1.isbombed = 0;

                            data1.likecount = data1.likes.length;
                            data1.bombedcount = data1.bombed.length;

                            if (data1.tweakCount / 1000 >= 1) {
                              data1.tweakCount =
                                parseFloat(data1.tweakCount / 1000).toFixed(1) +
                                "k";
                            }

                            data1.views = data1.viewsCount;
                            var viewCount = data1.viewsCount / 1000;
                            if (viewCount >= 1) {
                              data1.views =
                                parseFloat(viewCount).toFixed(1) + "k";
                            }

                            data1.commentCount = data1.commentsCount;
                            var commentCount = data1.commentsCount / 1000;
                            if (commentCount >= 1) {
                              data1.commentCount =
                                parseFloat(commentCount).toFixed(1) + "k";
                            }

                            if (data1.followerCount / 1000 >= 1) {
                              data1.followerCount =
                                parseFloat(data1.followerCount / 1000).toFixed(
                                  1
                                ) + "k";
                            }

                            if (data1.likecount / 1000 >= 1) {
                              data1.likecount =
                                parseFloat(data1.likecount / 1000).toFixed(1) +
                                "k";
                            }

                            if (data1.bombedcount / 1000 >= 1) {
                              data1.bombedcount =
                                parseFloat(data1.bombedcount / 1000).toFixed(
                                  1
                                ) + "k";
                            }

                            data.push(data1);
                            len--;
                            if (len == 0) {
                              var sort_by = function(field, reverse, primer) {
                                var key = primer
                                  ? function(x) {
                                      return primer(x[field]);
                                    }
                                  : function(x) {
                                      return x[field];
                                    };

                                reverse = !reverse ? 1 : -1;

                                return function(a, b) {
                                  return (
                                    (a = key(a)),
                                    (b = key(b)),
                                    reverse * ((a > b) - (b > a))
                                  );
                                };
                              };
                              data.sort(
                                sort_by("viewsCount", true, function(a) {
                                  return a;
                                })
                              );
                              resolve(data);
                            }
                          });
                      });
                  });
                });
                if (len == 0) resolve(res);
              }
            });
        } else if (categoryType == "Trending") {
          var date = new Date();
          date.setDate(date.getDate() - 1);
          //                Tweak.find({$and:[{ created: { $lt: date }},{ bombed: { $ne:userid }},{ $or: [{ publicScope: 1 }, { userid: userid }]}, { isbadtweak: { $ne: 1 }}]}).sort({ views: -1}).limit(limit).skip(start).exec((err, res) => {
          //                    Tweak.find({$and:[{ bombed: { $ne:userid }},{ publicScope: { $ne: 0 }}, { isbadtweak: { $ne: 1 }}]}).sort({ views: -1}).limit(limit).skip(start).exec((err, res) => {
          Tweak.find({
            $and: [
              { $where: "this.likes.length > 0" },
              { created: { $gt: date } },
              { bombed: { $ne: userid } },
              { publicScope: { $ne: 0 } },
              { isbadtweak: { $ne: 1 } }
            ]
          })
            .sort({ views: -1 })
            .limit(limit)
            .skip(start)
            .exec((err, res) => {
              var data = [];
              if (err) reject(err);
              else {
                var len = res.length;

                _.each(res, function(data1) {
                  User.findOne({ _id: data1.userid }).exec((err, result) => {
                    Comment.find({
                      $and: [{ tweakid: data1._id }, { userid: userid }]
                    })
                      .count()
                      .exec((err, count) => {
                        Tweak.find({ userid: result._id })
                          .count()
                          .exec((err, tweakCount) => {
                            data1.tweakCount = tweakCount;
                            var index = data1.likes.indexOf(userid);
                            if (index > -1) data1.isliked = 1;
                            else data1.isliked = 0;

                            var index = data1.viewers.indexOf(userid);
                            if (index > -1) data1.isviewed = 1;
                            else data1.isviewed = 0;

                            data1.followerCount = result.followers.length;

                            var index = result.followers.indexOf(userid);
                            if (index > -1) data1.isfollowing = 1;
                            else data1.isfollowing = 0;

                            if (count > 0) data1.iscommented = 1;
                            else data1.iscommented = 0;

                            if (result != null) {
                              data1.username = result.username;
                              data1.profilepic = result.profilepic;
                            }

                            var index = data1.likes.indexOf(userid);
                            if (index > -1) {
                              data1.isliked = 1;
                            } else data1.isliked = 0;
                            var index = data1.bombed.indexOf(userid);
                            if (index > -1) {
                              data1.isbombed = 1;
                            } else data1.isbombed = 0;

                            data1.likecount = data1.likes.length;
                            data1.bombedcount = data1.bombed.length;

                            if (data1.tweakCount / 1000 >= 1) {
                              data1.tweakCount =
                                parseFloat(data1.tweakCount / 1000).toFixed(1) +
                                "k";
                            }

                            data1.views = data1.viewsCount;
                            var viewCount = data1.viewsCount / 1000;
                            if (viewCount >= 1) {
                              data1.views =
                                parseFloat(viewCount).toFixed(1) + "k";
                            }

                            data1.commentCount = data1.commentsCount;
                            var commentCount = data1.commentsCount / 1000;
                            if (commentCount >= 1) {
                              data1.commentCount =
                                parseFloat(commentCount).toFixed(1) + "k";
                            }

                            if (data1.followerCount / 1000 >= 1) {
                              data1.followerCount =
                                parseFloat(data1.followerCount / 1000).toFixed(
                                  1
                                ) + "k";
                            }

                            if (data1.likecount / 1000 >= 1) {
                              data1.likecount =
                                parseFloat(data1.likecount / 1000).toFixed(1) +
                                "k";
                            }

                            if (data1.bombedcount / 1000 >= 1) {
                              data1.bombedcount =
                                parseFloat(data1.bombedcount / 1000).toFixed(
                                  1
                                ) + "k";
                            }

                            data.push(data1);
                            len--;
                            if (len == 0) {
                              var sort_by = function(field, reverse, primer) {
                                var key = primer
                                  ? function(x) {
                                      return primer(x[field]);
                                    }
                                  : function(x) {
                                      return x[field];
                                    };

                                reverse = !reverse ? 1 : -1;

                                return function(a, b) {
                                  return (
                                    (a = key(a)),
                                    (b = key(b)),
                                    reverse * ((a > b) - (b > a))
                                  );
                                };
                              };
                              data.sort(
                                sort_by("views", true, function(a) {
                                  return a;
                                })
                              );
                              resolve(data);
                            }
                          });
                      });
                  });
                });
                if (len == 0) resolve(res);
              }
            });
        } else if (categoryType == "Help") {
          Tweak.find({
            $and: [
              { help: 1 },
              { bombed: { $ne: userid } },
              { $or: [{ publicScope: 1 }, { userid: userid }] },
              { isbadtweak: { $ne: 1 } }
            ]
          })
            .sort({ created: -1 })
            .limit(limit)
            .skip(start)
            .exec((err, res) => {
              var data = [];
              if (err) reject(err);
              else {
                var len = res.length;

                _.each(res, function(data1) {
                  User.findOne({ _id: data1.userid }).exec((err, result) => {
                    Comment.find({
                      $and: [{ tweakid: data1._id }, { userid: userid }]
                    })
                      .count()
                      .exec((err, count) => {
                        Tweak.find({ userid: result._id })
                          .count()
                          .exec((err, tweakCount) => {
                            data1.tweakCount = tweakCount;
                            var index = data1.likes.indexOf(userid);
                            if (index > -1) data1.isliked = 1;
                            else data1.isliked = 0;

                            var index = data1.viewers.indexOf(userid);
                            if (index > -1) data1.isviewed = 1;
                            else data1.isviewed = 0;

                            data1.followerCount = result.followers.length;

                            var index = result.followers.indexOf(userid);
                            if (index > -1) data1.isfollowing = 1;
                            else data1.isfollowing = 0;

                            if (count > 0) data1.iscommented = 1;
                            else data1.iscommented = 0;

                            if (result != null) {
                              data1.username = result.username;
                              data1.profilepic = result.profilepic;
                            }

                            var index = data1.likes.indexOf(userid);
                            if (index > -1) {
                              data1.isliked = 1;
                            } else data1.isliked = 0;
                            var index = data1.bombed.indexOf(userid);
                            if (index > -1) {
                              data1.isbombed = 1;
                            } else data1.isbombed = 0;

                            data1.likecount = data1.likes.length;
                            data1.bombedcount = data1.bombed.length;

                            if (data1.tweakCount / 1000 >= 1) {
                              data1.tweakCount =
                                parseFloat(data1.tweakCount / 1000).toFixed(1) +
                                "k";
                            }

                            data1.views = data1.viewsCount;
                            var viewCount = data1.viewsCount / 1000;
                            if (viewCount >= 1) {
                              data1.views =
                                parseFloat(viewCount).toFixed(1) + "k";
                            }

                            data1.commentCount = data1.commentsCount;
                            var commentCount = data1.commentsCount / 1000;
                            if (commentCount >= 1) {
                              data1.commentCount =
                                parseFloat(commentCount).toFixed(1) + "k";
                            }

                            if (data1.followerCount / 1000 >= 1) {
                              data1.followerCount =
                                parseFloat(data1.followerCount / 1000).toFixed(
                                  1
                                ) + "k";
                            }

                            if (data1.likecount / 1000 >= 1) {
                              data1.likecount =
                                parseFloat(data1.likecount / 1000).toFixed(1) +
                                "k";
                            }

                            if (data1.bombedcount / 1000 >= 1) {
                              data1.bombedcount =
                                parseFloat(data1.bombedcount / 1000).toFixed(
                                  1
                                ) + "k";
                            }

                            data.push(data1);
                            len--;
                            if (len == 0) {
                              var sort_by = function(field, reverse, primer) {
                                var key = primer
                                  ? function(x) {
                                      return primer(x[field]);
                                    }
                                  : function(x) {
                                      return x[field];
                                    };

                                reverse = !reverse ? 1 : -1;

                                return function(a, b) {
                                  return (
                                    (a = key(a)),
                                    (b = key(b)),
                                    reverse * ((a > b) - (b > a))
                                  );
                                };
                              };
                              data.sort(
                                sort_by("created", true, function(a) {
                                  return a;
                                })
                              );
                              resolve(data);
                            }
                          });
                      });
                  });
                });
                if (len == 0) resolve(res);
              }
            });
        } else if (categoryType == "Category") {
          if (categoryid == null || categoryid == "") {
            reject("categoryid is required");
          } else {
            Category.findOne({ _id: categoryid }).exec((err, res) => {
              if (res != null) {
                Tweak.find({
                  $and: [
                    { "category.categoryid": categoryid },
                    { $or: [{ publicScope: 1 }, { userid: userid }] },
                    { isbadtweak: { $ne: 1 } }
                  ]
                })
                  .count()
                  .exec((err, tweaksCountByCat) => {
                    Tweak.find({
                      $and: [
                        { "category.categoryid": categoryid },
                        { $or: [{ publicScope: 1 }, { userid: userid }] },
                        { isbadtweak: { $ne: 1 } }
                      ]
                    })
                      .sort({ created: -1 })
                      .limit(limit)
                      .skip(start)
                      .exec((err, res) => {
                        var data = [];
                        if (err) reject(err);
                        else {
                          var len = res.length;

                          _.each(res, function(data1) {
                            User.findOne({ _id: data1.userid }).exec(
                              (err, result) => {
                                if (result) {
                                  Comment.find({
                                    $and: [
                                      { tweakid: data1._id },
                                      { userid: userid }
                                    ]
                                  })
                                    .count()
                                    .exec((err, count) => {
                                      Tweak.find({ userid: result._id })
                                        .count()
                                        .exec((err, tweakCount) => {
                                          data1.tweakCount = tweakCount;
                                          var index = data1.likes.indexOf(
                                            userid
                                          );
                                          if (index > -1) data1.isliked = 1;
                                          else data1.isliked = 0;

                                          var index = data1.viewers.indexOf(
                                            userid
                                          );
                                          if (index > -1) data1.isviewed = 1;
                                          else data1.isviewed = 0;

                                          data1.followerCount =
                                            result.followers.length;

                                          var index = result.followers.indexOf(
                                            userid
                                          );
                                          if (index > -1) data1.isfollowing = 1;
                                          else data1.isfollowing = 0;

                                          if (count > 0) data1.iscommented = 1;
                                          else data1.iscommented = 0;

                                          if (result != null) {
                                            data1.username = result.username;
                                            data1.profilepic =
                                              result.profilepic;
                                          }

                                          var index = data1.likes.indexOf(
                                            userid
                                          );
                                          if (index > -1) data1.isliked = 1;
                                          else data1.isliked = 0;

                                          var index = data1.bombed.indexOf(
                                            userid
                                          );
                                          if (index > -1) data1.isbombed = 1;
                                          else data1.isbombed = 0;

                                          data1.likecount = data1.likes.length;
                                          data1.bombedcount =
                                            data1.bombed.length;

                                          if (data1.tweakCount / 1000 >= 1) {
                                            data1.tweakCount =
                                              parseFloat(
                                                data1.tweakCount / 1000
                                              ).toFixed(1) + "k";
                                          }

                                          data1.views = data1.viewsCount;
                                          var viewCount =
                                            data1.viewsCount / 1000;
                                          if (viewCount >= 1) {
                                            data1.views =
                                              parseFloat(viewCount).toFixed(1) +
                                              "k";
                                          }

                                          data1.commentCount =
                                            data1.commentsCount;
                                          var commentCount =
                                            data1.commentsCount / 1000;
                                          if (commentCount >= 1) {
                                            data1.commentCount =
                                              parseFloat(commentCount).toFixed(
                                                1
                                              ) + "k";
                                          }

                                          if (data1.followerCount / 1000 >= 1) {
                                            data1.followerCount =
                                              parseFloat(
                                                data1.followerCount / 1000
                                              ).toFixed(1) + "k";
                                          }

                                          if (data1.likecount / 1000 >= 1) {
                                            data1.likecount =
                                              parseFloat(
                                                data1.likecount / 1000
                                              ).toFixed(1) + "k";
                                          }

                                          if (data1.bombedcount / 1000 >= 1) {
                                            data1.bombedcount =
                                              parseFloat(
                                                data1.bombedcount / 1000
                                              ).toFixed(1) + "k";
                                          }

                                          data.push(data1);
                                          len--;
                                          if (len == 0) {
                                            var sort_by = function(
                                              field,
                                              reverse,
                                              primer
                                            ) {
                                              var key = primer
                                                ? function(x) {
                                                    return primer(x[field]);
                                                  }
                                                : function(x) {
                                                    return x[field];
                                                  };

                                              reverse = !reverse ? 1 : -1;

                                              return function(a, b) {
                                                return (
                                                  (a = key(a)),
                                                  (b = key(b)),
                                                  reverse * ((a > b) - (b > a))
                                                );
                                              };
                                            };
                                            data.sort(
                                              sort_by("created", true, function(
                                                a
                                              ) {
                                                return a;
                                              })
                                            );
                                            data[0].count = tweaksCountByCat;
                                            resolve(data);
                                          }
                                        });
                                    });
                                } else {
                                  data.push(data1);
                                  len--;
                                  if (len == 0) {
                                    var sort_by = function(
                                      field,
                                      reverse,
                                      primer
                                    ) {
                                      var key = primer
                                        ? function(x) {
                                            return primer(x[field]);
                                          }
                                        : function(x) {
                                            return x[field];
                                          };

                                      reverse = !reverse ? 1 : -1;

                                      return function(a, b) {
                                        return (
                                          (a = key(a)),
                                          (b = key(b)),
                                          reverse * ((a > b) - (b > a))
                                        );
                                      };
                                    };
                                    data.sort(
                                      sort_by("created", true, function(a) {
                                        return a;
                                      })
                                    );
                                    data[0].count = tweaksCountByCat;
                                    resolve(data);
                                  }
                                }
                              }
                            );
                          });
                          if (len == 0) resolve(res);
                        }
                      });
                  });
              } else reject("Category does not exist");
            });
          }
        } else {
          reject("Enter correct Category Type.");
        }
      });
    },
    getTweaksforWebsite: (root, { start }) => {
      return new Promise((resolve, reject) => {
        var limit = 10;
        Tweak.find({})
          .count()
          .exec((err, tweakCount) => {
            Tweak.find({})
              .sort({ created: -1 })
              .limit(limit)
              .skip(start)
              .exec((err, res) => {
                var data = [];
                if (err) reject(err);
                else {
                  var len = res.length;

                  _.each(res, function(data1) {
                    User.findOne({ _id: data1.userid }).exec((err, result) => {
                      data1.tweakCount = tweakCount;
                      if (result != null) {
                        data1.username = result.username;
                        data1.profilepic = result.profilepic;
                      }
                      data.push(data1);
                      len--;
                      if (len == 0) {
                        var sort_by = function(field, reverse, primer) {
                          var key = primer
                            ? function(x) {
                                return primer(x[field]);
                              }
                            : function(x) {
                                return x[field];
                              };

                          reverse = !reverse ? 1 : -1;

                          return function(a, b) {
                            return (
                              (a = key(a)),
                              (b = key(b)),
                              reverse * ((a > b) - (b > a))
                            );
                          };
                        };
                        data.sort(
                          sort_by("created", true, function(a) {
                            return a;
                          })
                        );
                        resolve(data);
                      }
                    });
                  });
                  if (len == 0) resolve(res);
                }
              });
          });
      });
    },
    searchUserAdminNotification: (root, { searchString }) => {
      return new Promise((resolve, reject) => {
        User.find(
          { username: { $regex: "" + searchString, $options: "$i" } },
          { username: 1 }
        )
          .sort({ username: 1 })
          .exec((err, users) => {
            err ? reject(err) : resolve(users);
          });
      });
    },
    getSelectedUsersAdmin: (root, { users }) => {
      return new Promise((resolve, reject) => {
        User.find({ _id: { $in: users } }, { username: 1 })
          .sort({ username: 1 })
          .exec((err, users) => {
            err ? reject(err) : resolve(users);
          });
      });
    }
  },
  // mutations
  Mutation: {
    // tweak resolvers
    addTweak: (
      root,
      {
        userid,
        title,
        description,
        category,
        image,
        videourl,
        starttime,
        endtime,
        status,
        publicScope,
        savePermission,
        nsfw,
        staffpick,
        usertag,
        tags,
        bannerText,
        bannerColor,
        bannerXposition,
        bannerYposition,
        tweakimage,
        tweakurl,
        shareTypes
      }
    ) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: userid }).exec((err, res) => {
          if (res == null) {
            reject("User does not exist.");
          } else {
            var categoryData = [];
            if (category != null && category != "") {
              for (var i = 0; i < category.length; i++) {
                var data = { categoryid: category[i].categoryid };
                categoryData.push(data);
                Category.update(
                  { _id: data.categoryid },
                  { $inc: { count: 1 } },
                  (err, result) => {
                    if (err) {
                      console.log(
                        "error in categories: " + JSON.stringify(err)
                      );
                    } else {
                      console.log(
                        "result in categories: " + JSON.stringify(result)
                      );
                    }
                  }
                );
              }
            }
            var tagsData = [];
            if (tags != null && tags != "") {
              for (var i = 0; i < tags.length; i++) {
                var data = { tagName: tags[i].tagName };
                tagsData.push(data);
              }
              console.log("final tags data: " + JSON.stringify(tagsData));
            }
            var usertagData = [];
            if (usertag != null && usertag != "") {
              for (var i = 0; i < usertag.length; i++) {
                var data = { user: usertag[i].user };
                usertagData.push(data);
              }
              console.log(
                "final userTags data: " + JSON.stringify(usertagData)
              );
            }

            var newTweak = new Tweak({
              userid: userid,
              title: title,
              description: description,
              category: categoryData,
              image: image,
              videourl: videourl,
              starttime: starttime,
              endtime: endtime,
              status: status,
              publicScope: publicScope,
              savePermission: savePermission,
              nsfw: nsfw,
              staffpick: staffpick,
              usertag: usertagData,
              tags: tagsData,
              bannerText: bannerText,
              bannerColor: bannerColor,
              bannerXposition: bannerXposition,
              bannerYposition: bannerYposition,
              tweakimage: tweakimage,
              tweakurl: tweakurl
            });
            newTweak.save((err, resl) => {
              console.log("newTweak resl is%%: " + JSON.stringify(resl));
              if (!err) {
                if (resl.usertag != "") {
                  for (var i = 0; i < resl.usertag.length; i++) {
                    if (userid != resl.usertag[i].user) {
                      User.findOne({ _id: resl.usertag[i].user }).exec(
                        (err, tag) => {
                          var action = "tag";
                          var alert = res.username + " tagged you in a Tweak";

                          var newNotification = new Notification({
                            userid: tag._id,
                            alert: alert,
                            fromuserid: userid,
                            tweakid: resl._id,
                            type: action
                          });
                          newNotification.save((err, noti) => {});

                          if (
                            tag.notification == "public" ||
                            tag.notification == "known"
                          ) {
                            console.log("device: " + tag.devices);
                            if (tag.devices != null && tag.devices != "")
                              notifi(
                                tag.devices[0].devicetype,
                                tag.devices[0].devicetoken,
                                alert,
                                userid,
                                action,
                                res.profilepic,
                                resl.tweakimage,
                                resl.image,
                                resl._id
                              );
                          }
                        }
                      );
                    }
                  }
                }
                var longurl = urlvalue.watchurl + "/watch/" + resl._id;
                console.log("longurl:  " + longurl);
                shorturl(
                  longurl,
                  "bit.ly",
                  {
                    login: "mgitter",
                    apiKey: "R_4bcabc9d63d84945bec38d7a09cf27b1"
                  },
                  function(short) {
                    resl.shareurl = short;

                    Tweak.findOne({ userid: userid })
                      .count()
                      .exec((err, tweakcount) => {
                        User.update(
                          { _id: userid },
                          { $set: { tweakCount: tweakcount } },
                          (err, result) => {}
                        );
                      });

                    Tweak.update(
                      { _id: resl._id },
                      { $set: { shareurl: short } },
                      (err, result) => {
                        //    video(resl);
                      }
                    );
                  }
                );

                if (shareTypes != null && shareTypes != []) {
                  //console.log("shareDetails");
                  shareTypes.map((share, key) => {
                    console.log("shareDetails: " + share);
                    Tweak.update(
                      { _id: resl._id },
                      {
                        $addToSet: {
                          shareDetails: { user: userid, shareType: share }
                        }
                      },
                      (err, result) => {
                        Tweak.findOne({ _id: resl._id }, (err, result3) => {
                          Tweak.update(
                            { _id: resl._id },
                            { sharecount: result3.shareDetails.length },
                            (err, updated) => {}
                          );
                        });
                      }
                    );
                  });
                }
                err ? reject(err) : resolve(resl);
              } else {
                reject(err);
              }
            });
          }
        });
      });
    },

    updateTweak: (
      root,
      {
        _id,
        categoryType,
        title,
        description,
        category,
        image,
        videourl,
        starttime,
        endtime,
        status,
        publicScope,
        savePermission,
        nsfw,
        staffpick,
        help,
        usertag,
        tags,
        isbadtweak,
        userid,
        viewsCount,
        likes,
        bombed,
        value
      }
    ) => {
      return new Promise((resolve, reject) => {
        Tweak.findOne({ _id: _id }).exec((err, res) => {
          if (res == null) reject("Tweak does not exist.");
          else {
            var date = new Date();
            if (categoryType == "tweak") {
              var categoryArray = [];
              if (res.category != null) {
                for (var i = 0; i < res.category.length; i++) {
                  Category.update(
                    { _id: res.category[i].categoryid },
                    { $inc: { count: -1 } },
                    (err, result) => {}
                  );
                }
              }
              if (category != null && category != "") {
                for (var i = 0; i < category.length; i++) {
                  var data = { categoryid: category[i].categoryid };
                  categoryArray.push(data);
                  Category.update(
                    { _id: data.categoryid },
                    { $inc: { count: 1 } },
                    (err, result) => {}
                  );
                }
              }

              var tagsData = [];
              if (tags != null && tags != "") {
                for (var i = 0; i < tags.length; i++) {
                  var data = { tagName: tags[i].tagName };
                  tagsData.push(data);
                }
              }

              var usertagArray = [];

              if (usertag != null && usertag != "") {
                for (var i = 0; i < usertag.length; i++) {
                  if (userid != usertag[i].user) {
                    var data = { user: usertag[i].user };
                    usertagArray.push(data);

                    var action = "tag";
                    User.findOne({ _id: usertag[i].user }).exec((err, tag) => {
                      Notification.findOne({
                        $and: [
                          { userid: tag._id },
                          { type: action },
                          { tweakid: _id }
                        ]
                      }).exec((err, not) => {
                        if (not == null) {
                          if (
                            tag.notification == "public" ||
                            tag.notification == "known"
                          ) {
                            User.findOne({ _id: res.userid }).exec(
                              (err, data) => {
                                var alert =
                                  data.username + " tagged you in a Tweak";

                                var newNotification = new Notification({
                                  userid: tag._id,
                                  alert: alert,
                                  fromuserid: res.userid,
                                  tweakid: res._id,
                                  type: action
                                });
                                newNotification.save((err, noti) => {});
                                if (
                                  tag.notification == "public" ||
                                  tag.notification == "known"
                                ) {
                                  if (tag.devices != null && tag.devices != "")
                                    notifi(
                                      tag.devices[0].devicetype,
                                      tag.devices[0].devicetoken,
                                      alert,
                                      res.userid,
                                      action,
                                      data.profilepic,
                                      res.tweakimage,
                                      res.image,
                                      _id
                                    );
                                }
                              }
                            );
                          }
                        }
                      });
                    });
                  }
                }
              }

              Tweak.update(
                { _id: _id },
                {
                  $set: {
                    title: title,
                    description: description,
                    category: categoryArray,
                    image: image,
                    videourl: videourl,
                    starttime: starttime,
                    endtime: endtime,
                    status: status,
                    publicScope: publicScope,
                    savePermission: savePermission,
                    nsfw: nsfw,
                    staffpick: staffpick,
                    help: help,
                    usertag: usertagArray,
                    tags: tagsData,
                    isbadtweak: isbadtweak,
                    lastupdated: date,
                    tweakurl: null,
                    tweakimage: null
                  }
                },
                (err, result) => {
                  Tweak.findOne({ _id: _id }, (err, result3) => {
                    var index = result3.viewers.indexOf(userid);
                    if (index > -1) {
                      result3.isviewed = 1;
                    } else {
                      result3.isviewed = 0;
                    }
                    result3.message = "Tweak updated successfully.";
                    err ? reject(err) : resolve(result3);
                  });
                }
              );
            } else if (categoryType == "like") {
              User.findOne({ _id: userid }).exec((err, resl) => {
                if (resl == null) reject("User does not exist.");
                else {
                  if (value == 1) {
                    var index = res.likes.indexOf(userid);
                    if (index > -1) {
                      User.findOne({ _id: res.userid }).exec((err, result) => {
                        Tweak.update(
                          { _id: _id },
                          {
                            $set: {
                              likesCount: res.likes.length,
                              bombedCount: res.bombed.length
                            }
                          },
                          (err, result) => {}
                        );

                        Comment.find({
                          $and: [{ tweakid: _id }, { userid: userid }]
                        })
                          .count()
                          .exec((err, iscommented) => {
                            res.iscommented = 0;
                            if (iscommented > 0) res.iscommented = 1;

                            if (result != null) {
                              res.username = result.username;
                              res.profilepic = result.profilepic;
                            }

                            var index = res.likes.indexOf(userid);
                            if (index > -1) {
                              res.isliked = 1;
                            } else res.isliked = 0;
                            var index = res.bombed.indexOf(userid);
                            if (index > -1) {
                              res.isbombed = 1;
                            } else res.isbombed = 0;

                            res.likecount = res.likes.length;
                            res.bombedcount = res.bombed.length;

                            var index = res.viewers.indexOf(userid);
                            if (index > -1) {
                              res.isviewed = 1;
                            } else {
                              res.isviewed = 0;
                            }

                            User.findOne({ _id: userid }, { likes: 1 }).exec(
                              (err, likes) => {
                                User.update(
                                  { _id: userid },
                                  { $set: { likesCount: likes.likes.length } },
                                  (err, update) => {}
                                );
                              }
                            );
                            res.message = "Tweak updated successfully.";
                            err ? reject(err) : resolve(res);
                          });
                      });
                    } else {
                      var likeArray = [];
                      if (res.likes != null) {
                        res.likes.map(like => {
                          likeArray.push(like);
                        });
                      }
                      User.update(
                        { _id: userid },
                        { $push: { likes: { tweakid: _id } } },
                        (err, update) => {}
                      );
                      var bombedArray = res.bombed;
                      likeArray.push(userid);
                      var index = bombedArray.indexOf(userid);
                      if (index > -1) {
                        bombedArray.splice(index, 1);
                      }
                      Tweak.update(
                        { _id: _id },
                        { $set: { likes: likeArray, bombed: bombedArray } },
                        (err, result) => {
                          Tweak.update(
                            { _id: _id },
                            {
                              $set: {
                                likesCount: likeArray.length,
                                bombedCount: bombedArray.length
                              }
                            },
                            (err, result) => {}
                          );
                          Tweak.findOne({ _id: _id }, (err, result3) => {
                            var action = "like";
                            if (result3.userid != userid) {
                              Notification.findOne({
                                $and: [
                                  { tweakid: _id },
                                  { type: action },
                                  { fromuserid: userid }
                                ]
                              }).exec((err, not) => {
                                if (not == null) {
                                  if (result3.userid != userid) {
                                    var alert =
                                      resl.username + " liked your Tweak";

                                    var newNotification = new Notification({
                                      userid: result3.userid,
                                      alert: alert,
                                      fromuserid: userid,
                                      tweakid: _id,
                                      type: action
                                    });
                                    newNotification.save((err, noti) => {});

                                    User.findOne({ _id: result3.userid }).exec(
                                      (err, dtoken) => {
                                        if (dtoken.notification == "public") {
                                          if (
                                            dtoken.devices != null &&
                                            dtoken.devices != ""
                                          )
                                            notifi(
                                              dtoken.devices[0].devicetype,
                                              dtoken.devices[0].devicetoken,
                                              alert,
                                              userid,
                                              action,
                                              resl.profilepic,
                                              res.tweakimage,
                                              res.image,
                                              _id
                                            );
                                        } else if (
                                          dtoken.notification == "known"
                                        ) {
                                          if (
                                            dtoken.followers.indexOf(userid) >
                                              -1 ||
                                            dtoken.following.indexOf(userid) >
                                              -1
                                          ) {
                                            if (
                                              dtoken.devices != null &&
                                              dtoken.devices != ""
                                            )
                                              notifi(
                                                dtoken.devices[0].devicetype,
                                                dtoken.devices[0].devicetoken,
                                                alert,
                                                userid,
                                                action,
                                                resl.profilepic,
                                                res.tweakimage,
                                                res.image,
                                                _id
                                              );
                                          }
                                        }
                                      }
                                    );
                                  }
                                } else {
                                  var date = new Date();
                                  date.setDate(date.getDate());
                                  var startDate = moment(not.created);
                                  var endDate = moment(date);
                                  var hoursDiff = endDate.diff(
                                    startDate,
                                    "hours"
                                  );

                                  Notification.update(
                                    { _id: not._id },
                                    { created: date },
                                    (err, result) => {}
                                  );
                                  if (hoursDiff >= 24) {
                                    var alert =
                                      resl.username + " liked your Tweak";
                                    User.findOne({ _id: result3.userid }).exec(
                                      (err, dtoken) => {
                                        if (dtoken.notification == "public") {
                                          if (
                                            dtoken.devices != null &&
                                            dtoken.devices != ""
                                          )
                                            notifi(
                                              dtoken.devices[0].devicetype,
                                              dtoken.devices[0].devicetoken,
                                              alert,
                                              userid,
                                              action,
                                              resl.profilepic,
                                              res.tweakimage,
                                              res.image,
                                              _id
                                            );
                                        } else if (
                                          dtoken.notification == "known"
                                        ) {
                                          if (
                                            dtoken.followers.indexOf(userid) >
                                              -1 ||
                                            dtoken.following.indexOf(userid) >
                                              -1
                                          ) {
                                            if (
                                              dtoken.devices != null &&
                                              dtoken.devices != ""
                                            )
                                              notifi(
                                                dtoken.devices[0].devicetype,
                                                dtoken.devices[0].devicetoken,
                                                alert,
                                                userid,
                                                action,
                                                resl.profilepic,
                                                res.tweakimage,
                                                res.image,
                                                _id
                                              );
                                          }
                                        }
                                      }
                                    );
                                  }
                                }
                              });
                            }

                            User.findOne({ _id: result3.userid }).exec(
                              (err, result) => {
                                Comment.find({
                                  $and: [{ tweakid: _id }, { userid: userid }]
                                })
                                  .count()
                                  .exec((err, iscommented) => {
                                    result3.iscommented = 0;
                                    if (iscommented > 0)
                                      result3.iscommented = 1;

                                    if (result != null) {
                                      result3.username = result.username;
                                      result3.profilepic = result.profilepic;
                                    }

                                    var index = result3.likes.indexOf(userid);
                                    if (index > -1) {
                                      result3.isliked = 1;
                                    } else result3.isliked = 0;
                                    var index = result3.bombed.indexOf(userid);
                                    if (index > -1) {
                                      result3.isbombed = 1;
                                    } else result3.isbombed = 0;

                                    result3.likecount = result3.likes.length;
                                    result3.bombedcount = result3.bombed.length;

                                    var index = result3.viewers.indexOf(userid);
                                    if (index > -1) {
                                      result3.isviewed = 1;
                                    } else {
                                      result3.isviewed = 0;
                                    }

                                    User.findOne(
                                      { _id: userid },
                                      { likes: 1 }
                                    ).exec((err, likes) => {
                                      User.update(
                                        { _id: userid },
                                        {
                                          $set: {
                                            likesCount: likes.likes.length
                                          }
                                        },
                                        (err, update) => {}
                                      );
                                    });

                                    result3.message =
                                      "Tweak updated successfully.";
                                    err ? reject(err) : resolve(result3);
                                  });
                              }
                            );
                          });
                        }
                      );
                    }
                  } else if (value == 0) {
                    var likeArray = [];
                    if (res.likes != null) {
                      res.likes.map(like => {
                        likeArray.push(like);
                      });
                    }
                    var index = likeArray.indexOf(userid);
                    if (index > -1) {
                      likeArray.splice(index, 1);
                    }

                    var likes = [];
                    if (resl.likes != null) {
                      resl.likes.map(like => {
                        likes.push(like);
                      });
                    }

                    for (var i = 0; i < likes.length; i++) {
                      if (likes[i].tweakid == _id) {
                        likes.splice(i, 1);
                      }
                    }

                    User.update(
                      { _id: userid },
                      { $set: { likes: likes } },
                      (err, likes) => {}
                    );
                    Tweak.update(
                      { _id: _id },
                      { $set: { likes: likeArray } },
                      (err, result) => {
                        Tweak.update(
                          { _id: _id },
                          { $set: { likesCount: likeArray.length } },
                          (err, result) => {}
                        );
                        Tweak.findOne({ _id: _id }, (err, result3) => {
                          User.findOne({ _id: result3.userid }).exec(
                            (err, result) => {
                              Comment.find({
                                $and: [{ tweakid: _id }, { userid: userid }]
                              })
                                .count()
                                .exec((err, iscommented) => {
                                  result3.iscommented = 0;
                                  if (iscommented > 0) result3.iscommented = 1;

                                  if (result != null) {
                                    result3.username = result.username;
                                    result3.profilepic = result.profilepic;
                                  }

                                  var index = result3.likes.indexOf(userid);
                                  if (index > -1) {
                                    result3.isliked = 1;
                                  } else result3.isliked = 0;
                                  var index = result3.bombed.indexOf(userid);
                                  if (index > -1) {
                                    result3.isbombed = 1;
                                  } else result3.isbombed = 0;

                                  result3.likecount = result3.likes.length;
                                  result3.bombedcount = result3.bombed.length;

                                  var index = result3.viewers.indexOf(userid);
                                  if (index > -1) {
                                    result3.isviewed = 1;
                                  } else {
                                    result3.isviewed = 0;
                                  }

                                  User.findOne(
                                    { _id: userid },
                                    { likes: 1 }
                                  ).exec((err, likes) => {
                                    User.update(
                                      { _id: userid },
                                      {
                                        $set: { likesCount: likes.likes.length }
                                      },
                                      (err, update) => {}
                                    );
                                  });

                                  result3.message =
                                    "Tweak updated successfully.";
                                  err ? reject(err) : resolve(result3);
                                });
                            }
                          );
                        });
                      }
                    );
                  } else reject("Value should be either 1 or 0.");
                }
              });
            } else if (categoryType == "bombed") {
              User.findOne({ _id: userid }).exec((err, resl) => {
                if (resl == null) reject("User does not exist.");
                else {
                  if (value == 1) {
                    var index = res.bombed.indexOf(userid);
                    if (index > -1) {
                      User.findOne({ _id: res.userid }).exec((err, result) => {
                        Tweak.update(
                          { _id: _id },
                          {
                            $set: {
                              likesCount: res.likes.length,
                              bombedCount: res.bombed.length
                            }
                          },
                          (err, result) => {}
                        );
                        if (result != null) {
                          res.username = result.username;
                          res.profilepic = result.profilepic;
                        }

                        var index = res.likes.indexOf(userid);
                        if (index > -1) {
                          res.isliked = 1;
                        } else res.isliked = 0;
                        var index = res.bombed.indexOf(userid);
                        if (index > -1) {
                          res.isbombed = 1;
                        } else res.isbombed = 0;

                        res.likecount = res.likes.length;
                        res.bombedcount = res.bombed.length;

                        var index = res.viewers.indexOf(userid);
                        if (index > -1) {
                          res.isviewed = 1;
                        } else {
                          res.isviewed = 0;
                        }

                        res.message = "Tweak updated successfully.";
                        err ? reject(err) : resolve(res);
                      });
                    } else {
                      var bombedArray = [];
                      if (res.bombed != null) {
                        res.bombed.map(bomb => {
                          bombedArray.push(bomb);
                        });
                      }

                      bombedArray.push(userid);
                      var likeArray = res.likes;

                      var index = likeArray.indexOf(userid);
                      if (index > -1) {
                        likeArray.splice(index, 1);
                      }
                      Tweak.update(
                        { _id: _id },
                        { $set: { bombed: bombedArray, likes: likeArray } },
                        (err, result) => {
                          Tweak.update(
                            { _id: _id },
                            {
                              $set: {
                                likesCount: likeArray.length,
                                bombedCount: bombedArray.length
                              }
                            },
                            (err, result) => {}
                          );
                          Tweak.findOne({ bombed: { $in: [userid] } })
                            .count()
                            .exec((err, bombedCount) => {
                              User.update(
                                { _id: userid },
                                { $set: { bombedCount: bombedCount } },
                                (err, update) => {}
                              );
                            });
                          Tweak.findOne({ _id: _id }, (err, result3) => {
                            var action = "bombed";
                            if (result3.userid != userid) {
                              Notification.findOne({
                                $and: [
                                  { tweakid: _id },
                                  { type: action },
                                  { fromuserid: userid }
                                ]
                              }).exec((err, not) => {
                                if (not == null) {
                                  var alert =
                                    resl.username + " disliked your Tweak";

                                  var newNotification = new Notification({
                                    userid: result3.userid,
                                    alert: alert,
                                    fromuserid: userid,
                                    tweakid: _id,
                                    type: action
                                  });
                                  newNotification.save((err, noti) => {});
                                  User.findOne({ _id: result3.userid }).exec(
                                    (err, dtoken) => {
                                      if (dtoken.notification == "public") {
                                        if (
                                          dtoken.devices != null &&
                                          dtoken.devices != ""
                                        )
                                          notifi(
                                            dtoken.devices[0].devicetype,
                                            dtoken.devices[0].devicetoken,
                                            alert,
                                            userid,
                                            action,
                                            resl.profilepic,
                                            res.tweakimage,
                                            res.image,
                                            _id
                                          );
                                      } else if (
                                        dtoken.notification == "known"
                                      ) {
                                        if (
                                          dtoken.followers.indexOf(userid) >
                                            -1 ||
                                          dtoken.following.indexOf(userid) > -1
                                        ) {
                                          if (
                                            dtoken.devices != null &&
                                            dtoken.devices != ""
                                          )
                                            notifi(
                                              dtoken.devices[0].devicetype,
                                              dtoken.devices[0].devicetoken,
                                              alert,
                                              userid,
                                              action,
                                              resl.profilepic,
                                              res.tweakimage,
                                              res.image,
                                              _id
                                            );
                                        }
                                      }
                                    }
                                  );
                                } else {
                                  var date = new Date();
                                  date.setDate(date.getDate());
                                  var startDate = moment(not.created);
                                  var endDate = moment(date);
                                  var hoursDiff = endDate.diff(
                                    startDate,
                                    "hours"
                                  );

                                  Notification.update(
                                    { _id: not._id },
                                    { created: date },
                                    (err, result) => {}
                                  );
                                  if (hoursDiff >= 24) {
                                    var alert =
                                      resl.username + " disliked your Tweak";
                                    User.findOne({ _id: result3.userid }).exec(
                                      (err, dtoken) => {
                                        if (dtoken.notification == "public") {
                                          if (
                                            dtoken.devices != null &&
                                            dtoken.devices != ""
                                          )
                                            notifi(
                                              dtoken.devices[0].devicetype,
                                              dtoken.devices[0].devicetoken,
                                              alert,
                                              userid,
                                              action,
                                              resl.profilepic,
                                              res.tweakimage,
                                              res.image,
                                              _id
                                            );
                                        } else if (
                                          dtoken.notification == "known"
                                        ) {
                                          if (
                                            dtoken.followers.indexOf(userid) >
                                              -1 ||
                                            dtoken.following.indexOf(userid) >
                                              -1
                                          ) {
                                            if (
                                              dtoken.devices != null &&
                                              dtoken.devices != ""
                                            )
                                              notifi(
                                                dtoken.devices[0].devicetype,
                                                dtoken.devices[0].devicetoken,
                                                alert,
                                                userid,
                                                action,
                                                resl.profilepic,
                                                res.tweakimage,
                                                res.image,
                                                _id
                                              );
                                          }
                                        }
                                      }
                                    );
                                  }
                                }
                              });
                            }
                            User.findOne({ _id: result3.userid }).exec(
                              (err, result) => {
                                if (result != null) {
                                  result3.username = result.username;
                                  result3.profilepic = result.profilepic;
                                }

                                var index = result3.likes.indexOf(userid);
                                if (index > -1) {
                                  result3.isliked = 1;
                                } else result3.isliked = 0;
                                var index = result3.bombed.indexOf(userid);
                                if (index > -1) {
                                  result3.isbombed = 1;
                                } else result3.isbombed = 0;

                                result3.likecount = result3.likes.length;
                                result3.bombedcount = result3.bombed.length;

                                var index = result3.viewers.indexOf(userid);
                                if (index > -1) {
                                  result3.isviewed = 1;
                                } else {
                                  result3.isviewed = 0;
                                }

                                result3.message = "Tweak updated successfully.";
                                err ? reject(err) : resolve(result3);
                              }
                            );
                          });
                        }
                      );
                    }
                  } else if (value == 0) {
                    var bombedArray = [];
                    if (res.bombed != null) {
                      res.bombed.map(bomb => {
                        bombedArray.push(bomb);
                      });
                    }

                    var index = bombedArray.indexOf(userid);
                    if (index > -1) {
                      bombedArray.splice(index, 1);
                    }

                    Tweak.update(
                      { _id: _id },
                      { $set: { bombed: bombedArray } },
                      (err, result) => {
                        Tweak.update(
                          { _id: _id },
                          { $set: { bombedCount: bombedArray.length } },
                          (err, result) => {}
                        );

                        Tweak.findOne({ _id: _id }, (err, result3) => {
                          User.findOne({ _id: result3.userid }).exec(
                            (err, result) => {
                              if (result != null) {
                                result3.username = result.username;
                                result3.profilepic = result.profilepic;
                              }

                              var index = result3.likes.indexOf(userid);
                              if (index > -1) {
                                result3.isliked = 1;
                              } else result3.isliked = 0;
                              var index = result3.bombed.indexOf(userid);
                              if (index > -1) {
                                result3.isbombed = 1;
                              } else result3.isbombed = 0;

                              result3.likecount = result3.likes.length;
                              result3.bombedcount = result3.bombed.length;

                              var index = result3.viewers.indexOf(userid);
                              if (index > -1) {
                                result3.isviewed = 1;
                              } else {
                                result3.isviewed = 0;
                              }

                              result3.message = "Tweak updated successfully.";
                              err ? reject(err) : resolve(result3);
                            }
                          );
                        });
                      }
                    );
                  } else reject("Value should be either 1 or 0.");
                }
              });
            } else if (categoryType == "view") {
              var viewers = res.viewers.slice(0);
              var index = res.viewers.indexOf(userid);
              if (index == -1) viewers.push(userid);

              Tweak.update(
                { _id: _id },
                { $set: { viewsCount: ++res.viewsCount, viewers: viewers } },
                (err, result) => {
                  Tweak.findOne({ _id: _id }, (err, result3) => {
                    var index = result3.viewers.indexOf(userid);
                    if (index > -1) {
                      result3.isviewed = 1;
                    } else {
                      result3.isviewed = 0;
                    }

                    Tweak.findOne({ viewers: { $in: [userid] } })
                      .count()
                      .exec((err, viewsCount) => {
                        User.update(
                          { _id: userid },
                          { $set: { viewsCount: viewsCount } },
                          (err, update) => {}
                        );
                      });

                    result3.message = "Tweak updated successfully.";
                    err ? reject(err) : resolve(result3);
                  });
                }
              );
            } else {
              reject("Enter correct Category Type.");
            }
          }
        });
      });
    },
    removeTweak: (obj, { _id, tweakid }) => {
      return new Promise((resolve, reject) => {
        Tweak.findOne({ _id: tweakid }, (err, res) => {
          if (err || res == null) {
            reject("Tweak was not found");
          } else {
            if (res.userid == _id) {
              if (res.category != null) {
                for (var i = 0; i < res.category.length; i++) {
                  Category.update(
                    { _id: res.category[i].categoryid },
                    { $inc: { count: -1 } },
                    (err, result) => {}
                  );
                }
              }
              Tweak.remove({ _id: tweakid }, (err, result) => {
                if (err) reject(err);
                else {
                  User.find(
                    { "likes.tweakid": { $in: [tweakid] } },
                    (err1, users) => {
                      //    console.log(JSON.stringify(users));
                      users.map((user, key) => {
                        var index;
                        user.likes.map((like, key) => {
                          if (like.tweakid == tweakid) index = key;
                        });
                        user.likes.splice(index, 1);
                        User.update(
                          { _id: user._id },
                          { $set: { likes: user.likes } },
                          (err, updated) => {}
                        );
                      });
                    }
                  );
                  Comment.remove({ tweakid: tweakid }, (err1, res1) => {});
                  Notification.remove({ tweakid: tweakid }, (err2, res2) => {});
                  res.message = "Tweak deleted";
                  resolve(res);
                }
              });
            } else reject("Unauthorised access");
          }
        });
      });
    },
    removeTweakAdmin: (obj, { tweakids }) => {
      return new Promise((resolve, reject) => {
        if (tweakids.length == 0) {
          reject("No tweakids found.");
        } else {
          tweakids.map((tweakid, key) => {
            Tweak.findOne({ _id: tweakid }, (err, res) => {
              if (err || res == null) {
                reject("Tweak was not found");
              } else {
                if (res.category != null) {
                  for (var i = 0; i < res.category.length; i++) {
                    Category.update(
                      { _id: res.category[i].categoryid },
                      { $inc: { count: -1 } },
                      (err, result) => {}
                    );
                  }
                }
                Tweak.remove({ _id: tweakid }, (err, result) => {
                  if (err) reject(err);
                  else {
                    Comment.remove({ tweakid: tweakid }, (err1, res1) => {});
                    Notification.remove(
                      { tweakid: tweakid },
                      (err2, res2) => {}
                    );
                    res.message = "Tweak deleted";
                    resolve(res);
                  }
                });
              }
            });
          });
        }
      });
    },
    updateTweakAdmin: (root, { _id, title, category, status, staffpick }) => {
      return new Promise((resolve, reject) => {
        var categoryData = [];
        if (category != null && category != "") {
          for (var i = 0; i < category.length; i++) {
            var data = { categoryid: category[i].categoryid };
            categoryData.push(data);
          }
        }
        Tweak.update(
          { _id: _id },
          {
            $set: {
              staffpick: staffpick,
              title: title,
              category: categoryData,
              status: status
            }
          },
          (err, result) => {
            Tweak.findOne({ _id: _id }, (err, result3) => {
              result3.message = "Updated";
              err ? reject(err) : resolve(result3);
            });
          }
        );
      });
    },
    flagTweak: (root, { _id, userid, flaggedType }) => {
      console.log("the data to send: " + _id + userid + flaggedType);
      return new Promise((resolve, reject) => {
        Tweak.findOne(
          { $and: [{ _id: _id }, { "flagged.user": { $in: [userid] } }] },
          (err, tweak) => {
            console.log("tweak found is: " + JSON.stringify(tweak));
            if (tweak == null) {
              Tweak.update(
                { _id: _id },
                {
                  $addToSet: {
                    flagged: {
                      user: userid,
                      tweak: _id,
                      flaggedType: flaggedType
                    }
                  }
                },
                (err, result) => {
                  console.log("updating tweak");
                  Tweak.findOne({ _id: _id }, (err, result3) => {
                    if (result3 != null) {
                      Tweak.findOne({
                        $and: [
                          { userid: result3.userid },
                          { flagged: { $ne: [] } }
                        ]
                      })
                        .count()
                        .exec((err, flaggedcount) => {
                          User.update(
                            { _id: result3.userid },
                            { $set: { flaggedcount: flaggedcount } },
                            (err, update) => {}
                          );
                        });
                    } else {
                      console.log("no tweaks found");
                    }
                    err ? reject(err) : resolve(result3);
                  });
                }
              );
            } else {
              console.log("coming to else");
              var flagged = tweak.flagged;
              console.log("tweak.flagged is: " + JSON.stringify(flagged));
              flagged.map((flag, key) => {
                if (flag.user == userid) flagged[key].flaggedType = flaggedType;
              });

              Tweak.update(
                { _id: _id },
                { $set: { flagged: flagged } },
                (err, result) => {
                  Tweak.findOne({ _id: _id }, (err, result3) => {
                    //console.log("result for tweakisss: "+JSON.stringify(result3))
                    User.find({ _id: userid }, (err, userResult) => {
                      //console.log("user email found in tweak db is: "+JSON.stringify(userResult[0].email))
                      User.find({ role: "Admin" }, (err, admins) => {
                        console.log("admins found: " + JSON.stringify(admins));
                        if (admins.length > 0) {
                          admins.map((admin, key) => {
                            if (userResult[0].email) {
                              var fromMailid = userResult[0].email;
                            } else {
                              var fromMailid = CONFIG_DATA.SENDGRID_EMAIL;
                            }
                            var toMailid = admin.email;
                            var subject = "Tweak is flagged";
                            console.log("from mail: " + fromMailid);
                            if (!result3.shareurl) {
                              var url = result3.title;
                            } else {
                              var tweak = result3.shareurl;
                              var url =
                                "<a href=" +
                                tweak +
                                ">" +
                                result3.title +
                                "</a>";
                            }
                            var body =
                              "Hello Tweak Admins, <br/>Someone flagged following tweak.  <br/><br/>tweak: " +
                              url +
                              " <br/><br/>Reason for flagging: " +
                              flaggedType +
                              ". <br/><br/>This message generated automatically by the Tweak bot.";
                            console.log(
                              "body to send: " + JSON.stringify(body)
                            );
                            sendEmail(
                              fromMailid,
                              toMailid,
                              subject,
                              body,
                              true
                            );
                          });
                        } else {
                          console.log("no admin found");
                        }
                      });
                    });
                    err ? reject(err) : resolve(result3);
                  });
                }
              );
            }
          }
        );
      });
    },
    share: (root, { _id }) => {
      return new Promise((resolve, reject) => {
        Tweak.update(
          { _id: _id },
          { $inc: { sharecount: 1 } },
          (err, result) => {
            Tweak.findOne({ _id: _id }, (err, result3) => {
              err ? reject(err) : resolve(result3);
            });
          }
        );
      });
    },
    shareDetails: (root, { _id, userid, shareType }) => {
      return new Promise((resolve, reject) => {
        Tweak.update(
          { _id: _id },
          {
            $addToSet: { shareDetails: { user: userid, shareType: shareType } }
          },
          (err, result) => {
            //console.log("result: "+JSON.stringify(result));
            Tweak.findOne({ _id: _id }, (err, result3) => {
              //console.log("result3 is: "+JSON.stringify(result3));
              Tweak.update(
                { _id: _id },
                { sharecount: result3.shareDetails.length },
                (err, updated) => {
                  //console.log("update done: "+JSON.stringify(updated));
                }
              );
              err ? reject(err) : resolve(result3);
            });
          }
        );
      });
    },
    suspendTweak: (root, { tweakids }) => {
      return new Promise((resolve, reject) => {
        console.log("tweakids are:" + JSON.stringify(tweakids));
        if (tweakids.length == 0) {
          console.log("No ids found.");
        } else {
          tweakids.map((tweakId, key) => {
            Tweak.findOne({ _id: tweakId }, (err, tweak) => {
              if (tweak) {
                Tweak.update(
                  { _id: tweakId },
                  { $set: { status: 2 } },
                  (err, result) => {
                    resolve({ message: "Tweak suspended" });
                  }
                );
              }
            });
          });
        }
      });
    },
    makeActiveTweak: (root, { tweakid }) => {
      return new Promise((resolve, reject) => {
        Tweak.update({ _id: tweakid }, { $set: { status: 1 } }, (err, res) => {
          resolve({ message: "Tweak is Active now " });
        });
      });
    },
    moveCategory: (root, { _id, moveId }) => {
      return new Promise((resolve, reject) => {
        //db.getCollection('tweaks').update({'category.categoryid': ObjectId("565ef21b55b323d835391847")},{$set: {'category.$.categoryid': ObjectId("565ef23055b323d835391849")}},{multi: true})
        Tweak.update(
          { "category.categoryid": _id },
          { $set: { "category.$.categoryid": moveId } },
          { multi: true },
          (err, result) => {
            Category.update(
              { _id: _id },
              { $set: { count: 0 } },
              (err, updated) => {}
            );
            Tweak.findOne({ "category.categoryid": moveId })
              .count()
              .exec((err, tweakCount) => {
                Category.update(
                  { _id: moveId },
                  { $set: { count: tweakCount } },
                  (err, category) => {
                    Category.find({})
                      .sort({ categoryname: 1 })
                      .exec((err, categories) => {
                        err ? reject(err) : resolve(categories);
                      });
                  }
                );
              });
          }
        );
      });
    },
    updateShareUrls: (root, {}) => {
      return new Promise((resolve, reject) => {
        Tweak.find({ shareurl: { $exists: false } }).exec((err, tweaks) => {
          if (!tweaks) {
            console.log("no tweaks found without shareurl");
          } else {
            var len = tweaks.length;
            console.log("total tweaks length is: " + len);
            var start = 0;
            var limit = 100;
            var interval = setInterval(function() {
              var tweaksData = tweaks;
              tweaksData = tweaksData.slice(start, limit);
              console.log(
                "start is " +
                  start +
                  "  limit is " +
                  limit +
                  "  TWEAKS len is " +
                  tweaksData.length
              );
              start = limit;
              limit = start + 100;
              if (tweaksData.length > 0) {
                tweaksData.map((tweak, key) => {
                  var longurl =
                    "http://play.tweakvideos.net/index.php?id=" + tweak._id;
                  shorturl(
                    longurl,
                    "bit.ly",
                    {
                      login: "mgitter",
                      apiKey: "R_4bcabc9d63d84945bec38d7a09cf27b1"
                    },
                    function(short) {
                      console.log(short);
                      Tweak.update(
                        { _id: tweak._id },
                        { $set: { shareurl: short } },
                        (err, result) => {
                          //    video(resl);
                        }
                      );
                    }
                  );
                });
              } else {
                clearInterval(interval);
              }
            }, 60000);
          }
          err ? reject(err) : resolve(tweaks);
        });
      });
    },

    signUp: (
      root,
      {
        name,
        username,
        email,
        password,
        profilepic,
        gender,
        age,
        biodata,
        location,
        devicetoken,
        devicetype,
        version,
        appversion
      }
    ) => {
      return new Promise((resolve, reject) => {
        email = email.toLowerCase();
        var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!reg.test(email)) {
          reject("Enter valid email id");
        } else {
          User.findOne(
            { username: { $regex: "^" + username + "$", $options: "$i" } },
            (err, res) => {
              if (res != null) {
                reject("Sorry, this username already exists");
              } else {
                User.findOne({ email: email }, (err, res1) => {
                  if (res1 != null) {
                    reject("Sorry, this email already exists");
                  } else {
                    if (password.length < 4)
                      reject(
                        "Password should contain minimum four characters."
                      );
                    else if (devicetype == null || devicetype == "")
                      reject("Devicetype is mandatory.");
                    else {
                      User.findOne(
                        { "sociallogin.facebook.email": email },
                        (err, result) => {
                          if (result == null) {
                            var newUser = new User({
                              name: name,
                              username: username,
                              email: email,
                              password: password,
                              profilepic: profilepic,
                              gender: gender,
                              age: age,
                              biodata: biodata,
                              location: location,
                              devices: {
                                devicetoken: devicetoken,
                                devicetype: devicetype,
                                version: version,
                                lastLoginDevice: devicetype
                              },
                              appversion: appversion,
                              logintype: "Email"
                            });
                            newUser.save((err, result1) => {
                              err ? reject(err) : resolve(result1);
                            });
                          } else {
                            if (result.email == null) {
                              var date = new Date();
                              User.update(
                                { _id: result._id },
                                {
                                  $set: {
                                    name: name,
                                    username: username,
                                    email: email,
                                    password: password,
                                    profilepic: profilepic,
                                    gender: gender,
                                    age: age,
                                    biodata: biodata,
                                    location: location,
                                    devices: {
                                      devicetoken: devicetoken,
                                      devicetype: devicetype,
                                      version: version,
                                      lastLoginDevice: devicetype
                                    },
                                    appversion: appversion,
                                    lastlogin: date,
                                    logintype: "Email"
                                  }
                                },
                                (err, result1) => {
                                  err
                                    ? reject(err)
                                    : resolve(
                                        User.findOne({ _id: result._id })
                                      );
                                }
                              );
                            } else {
                              var date = new Date();
                              var newUser = new User({
                                name: name,
                                username: username,
                                email: email,
                                password: password,
                                profilepic: profilepic,
                                gender: gender,
                                age: age,
                                biodata: biodata,
                                location: location,
                                devices: {
                                  devicetoken: devicetoken,
                                  devicetype: devicetype,
                                  version: version,
                                  lastLoginDevice: devicetype
                                },
                                appversion: appversion,
                                lastlogin: date,
                                logintype: "Email"
                              });
                              newUser.save((err, result1) => {
                                err ? reject(err) : resolve(result1);
                              });
                            }
                          }
                        }
                      );
                    }
                  }
                });
              }
            }
          );
        }
      });
    },
    StafffUsersignUp: (
      root,
      { name, username, email, password, role, isFirstLogin }
    ) => {
      return new Promise((resolve, reject) => {
        email = email.toLowerCase();
        var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!reg.test(email)) {
          reject("Enter valid email id");
        } else {
          console.log("else coming: " + email + username);
          User.findOne(
            { username: { $regex: "^" + username + "$", $options: "$i" } },
            (err, res) => {
              if (res != null) {
                console.log("%%% username exists");
                if (res.email) {
                  console.log(
                    "email check of existed user: " + JSON.stringify(res.email)
                  );
                  User.update(
                    { _id: res._id },
                    {
                      $set: {
                        role: role,
                        isFirstLogin: true,
                        isStaffDelete: false
                      }
                    },
                    (err, result) => {
                      var smtpTransport = nodemailer.createTransport(
                        sgTransport(options)
                      );
                      var mailOptions = {
                        to: res.email,
                        from: "info@TweakVideos.com",
                        subject: "Acess  to Tweak Videos",
                        html:
                          "Hello " +
                          res.name +
                          ", <br/><br/>You have been given <b>" +
                          role +
                          " access</b> to Tweak Videos, please reset your personal password by clicking the below link and use below username for login.<br/><br/> Url: " +
                          redirectUrl +
                          "/resetpassword/" +
                          res._id +
                          " <br/><br/>Username: " +
                          res.name +
                          "<br/><br/> If you feel this message has been received in error please contact info@tweakvideos.com"
                      };
                      smtpTransport.sendMail(mailOptions, function(err) {
                        console.log("sendMail: " + JSON.stringify(err));
                        if (err) {
                          reject("Failed to send email.");
                        } else {
                          //user.message="Mail sent successfully.";
                          //resolve(user);
                        }
                      });
                      err ? reject(err) : resolve(result);
                    }
                  );
                } else {
                  console.log("user exists with no email");
                  User.update(
                    { _id: res._id },
                    {
                      $set: {
                        role: role,
                        isFirstLogin: true,
                        email: email,
                        isStaffDelete: false
                      }
                    },
                    (err, result) => {
                      console.log("result is: " + JSON.stringify(result));
                      User.findOne({ _id: res._id }).exec((err, resultt) => {
                        var smtpTransport = nodemailer.createTransport(
                          sgTransport(options)
                        );
                        var mailOptions = {
                          to: res.email,
                          from: "info@TweakVideos.com",
                          subject: "Acess  to Tweak Videos",
                          html:
                            "Hello " +
                            res.name +
                            ", <br/><br/>You have been given <b>" +
                            role +
                            " access</b> to Tweak Videos, please reset your personal password by clicking the below link and use below username for login.<br/><br/> Url: " +
                            redirectUrl +
                            "/resetpassword/" +
                            res._id +
                            " <br/><br/>Username: " +
                            res.name +
                            "<br/><br/> If you feel this message has been received in error please contact info@tweakvideos.com"
                        };
                        smtpTransport.sendMail(mailOptions, function(err) {
                          console.log("sendMail: " + JSON.stringify(err));
                          if (err) {
                            reject("Failed to send email.");
                          } else {
                            //user.message="Mail sent successfully.";
                            //resolve(user);
                          }
                        });
                        err ? reject(err) : resolve(resultt);
                      });
                    }
                  );
                }
              } else {
                User.findOne({ email: email }, (err, res1) => {
                  console.log(
                    "%%%% email check result: " + JSON.stringify(res1)
                  );
                  if (res1 != null) {
                    console.log("%%%% email exists");
                    User.update(
                      { _id: res1._id },
                      {
                        $set: {
                          role: role,
                          isFirstLogin: true,
                          isStaffDelete: false
                        }
                      },
                      (err, result) => {
                        console.log(
                          "result of user update: " + JSON.stringify(result)
                        );
                        User.findOne({ _id: res1._id }).exec((err, result2) => {
                          var smtpTransport = nodemailer.createTransport(
                            sgTransport(options)
                          );
                          var mailOptions = {
                            to: res1.email,
                            from: "info@TweakVideos.com",
                            subject: "Acess  to Tweak Videos",
                            html:
                              "Hello " +
                              res1.name +
                              ", <br/><br/>You have been given <b>" +
                              role +
                              " access</b> to Tweak Videos, please reset your personal password by clicking the below link and use below username for login.<br/><br/> Url: " +
                              redirectUrl +
                              "/resetpassword/" +
                              res1._id +
                              " <br/><br/>Username: " +
                              res1.username +
                              "<br/><br/> If you feel this message has been received in error please contact info@tweakvideos.com"
                          };
                          smtpTransport.sendMail(mailOptions, function(err) {
                            console.log("sendMail: " + JSON.stringify(err));
                            if (err) {
                              reject("Failed to send email.");
                            } else {
                              //user.message="Mail sent successfully.";
                              //resolve(user);
                            }
                          });
                          err ? reject(err) : resolve(result2);
                        });
                      }
                    );
                  } else {
                    console.log("%%% username and email not exists");
                    if (password.length < 4)
                      reject(
                        "Password should contain minimum four characters."
                      );
                    else {
                      console.log("%%% creating new user");
                      var newUser = new User({
                        name: name,
                        username: username,
                        email: email,
                        password: password,
                        role: role,
                        isFirstLogin: true,
                        isStaffDelete: false
                      });
                      newUser.save((err, result1) => {
                        var mailOptions = {
                          to: email,
                          from: "info@TweakVideos.com",
                          subject: "Acess  to Tweak Videos",
                          html:
                            "Hello " +
                            result1.name +
                            ", <br/><br/>You have been given <b>" +
                            role +
                            " access</b> to Tweak Videos, please set your personal password by clicking the below link and use given username for login.<br/><br/> Url: " +
                            redirectUrl +
                            "/resetpassword/" +
                            result1._id +
                            "<br/><br/> Username: " +
                            result1.username +
                            " <br/><br/> If you feel this message has been received in error please contact info@tweakvideos.com"
                        };
                        var smtpTransport = nodemailer.createTransport(
                          sgTransport(options)
                        );
                        smtpTransport.sendMail(mailOptions, function(err) {
                          console.log("sendMail: " + JSON.stringify(err));
                          if (err) {
                            reject("Failed to send email.");
                          } else {
                            //user.message="Mail sent successfully.";
                            //resolve(user);
                          }
                        });
                        err ? reject(err) : resolve(result1);
                      });
                    }
                  }
                });
              }
            }
          );
        } //end else
      });
    },
    twitterLogin: (
      root,
      {
        twitterid,
        username,
        profilepic,
        gender,
        dob,
        devicetoken,
        devicetype,
        version,
        appversion
      }
    ) => {
      return new Promise((resolve, reject) => {
        if (twitterid == null || twitterid == "")
          reject("Twitter id is mandatory.");
        else if (devicetype == null || devicetype == "")
          reject("Devicetype is mandatory.");
        else {
          console.log("username" + username);
          User.findOne(
            { "sociallogin.twitter.twitterid": twitterid },
            (err, res) => {
              console.log(
                "res for user find in twitter login: " + JSON.stringify(res)
              );
              if (res == null) {
                var date = new Date();
                var newUser = new User({
                  profilepic: profilepic,
                  devices: {
                    devicetoken: devicetoken,
                    devicetype: devicetype,
                    version: version,
                    lastLoginDevice: devicetype
                  },
                  appversion: appversion,
                  sociallogin: {
                    twitter: {
                      twitterid: twitterid,
                      name: username,
                      profilepic: profilepic,
                      gender: gender,
                      dob: dob
                    }
                  },
                  lastlogin: date,
                  logintype: "Twitter"
                });
                newUser.save((err, result) => {
                  Tweak.find({ userid: result._id })
                    .count()
                    .exec((err, result1) => {
                      result.tweakcount = result1;
                      if (result.tweakcount / 1000 >= 1) {
                        result.tweakcount =
                          parseFloat(result.tweakcount / 1000).toFixed(1) + "k";
                      }
                      err ? reject(err) : resolve(result);
                    });
                });
              } else {
                let devices = [];
                var deviceObj = {};
                if (!res.devices) {
                  deviceObj.devicetype = devicetype;
                  deviceObj.devicetoken = null;
                  deviceObj.lastLoginDevice = devicetype;
                  devices.push(deviceObj);
                } else {
                  if (res.devices[0].devicetype) {
                    deviceObj.devicetype = res.devices[0].devicetype;
                  }
                  if (res.devices[0].devicetoken) {
                    deviceObj.devicetoken = res.devices[0].devicetoken;
                  }
                  deviceObj.lastLoginDevice = devicetype;
                  devices.push(deviceObj);
                }
                if (devicetype == "web") {
                  var date = new Date();
                  User.update(
                    { _id: res._id },
                    {
                      $set: {
                        devices: devices,
                        appversion: appversion,
                        sociallogin: {
                          twitter: {
                            twitterid: twitterid,
                            name: username,
                            profilepic: profilepic,
                            gender: gender,
                            dob: dob
                          },
                          facebook: {
                            facebookid: res.sociallogin.facebook.facebookid,
                            name: res.sociallogin.facebook.name,
                            email: res.sociallogin.facebook.email,
                            profilepic: res.sociallogin.facebook.profilepic,
                            gender: res.sociallogin.facebook.gender,
                            dob: res.sociallogin.facebook.dob
                          }
                        },
                        lastlogin: date,
                        logintype: "Twitter"
                      }
                    },
                    (err, result) => {
                      User.findOne({ _id: res._id }).then(result => {
                        Tweak.find({ userid: res._id })
                          .count()
                          .exec((err, result1) => {
                            result.tweakcount = result1;
                            if (result.tweakcount / 1000 >= 1) {
                              result.tweakcount =
                                parseFloat(result.tweakcount / 1000).toFixed(
                                  1
                                ) + "k";
                            }
                            err ? reject(err) : resolve(result);
                          });
                      });
                    }
                  );
                } else {
                  var date = new Date();
                  User.update(
                    { _id: res._id },
                    {
                      $set: {
                        devices: {
                          devicetoken: devicetoken,
                          devicetype: devicetype,
                          version: version,
                          lastLoginDevice: devicetype
                        },
                        appversion: appversion,
                        sociallogin: {
                          twitter: {
                            twitterid: twitterid,
                            name: username,
                            profilepic: profilepic,
                            gender: gender,
                            dob: dob
                          },
                          facebook: {
                            facebookid: res.sociallogin.facebook.facebookid,
                            name: res.sociallogin.facebook.name,
                            email: res.sociallogin.facebook.email,
                            profilepic: res.sociallogin.facebook.profilepic,
                            gender: res.sociallogin.facebook.gender,
                            dob: res.sociallogin.facebook.dob
                          }
                        },
                        lastlogin: date,
                        logintype: "Twitter"
                      }
                    },
                    (err, result) => {
                      User.findOne({ _id: res._id }).then(result => {
                        Tweak.find({ userid: res._id })
                          .count()
                          .exec((err, result1) => {
                            result.tweakcount = result1;
                            if (result.tweakcount / 1000 >= 1) {
                              result.tweakcount =
                                parseFloat(result.tweakcount / 1000).toFixed(
                                  1
                                ) + "k";
                            }
                            err ? reject(err) : resolve(result);
                          });
                      });
                    }
                  );
                }
              }
            }
          );
        }
      });
    },
    facebookLogin: (
      root,
      {
        facebookid,
        name,
        email,
        profilepic,
        gender,
        dob,
        devicetoken,
        devicetype,
        version,
        appversion
      }
    ) => {
      return new Promise((resolve, reject) => {
        if (facebookid == null || facebookid == "")
          reject("Facebook id is mandatory.");
        else if (devicetype == null || devicetype == "")
          reject("Devicetype is mandatory.");
        else {
          User.findOne(
            { "sociallogin.facebook.facebookid": facebookid },
            (err, res) => {
              if (res == null) {
                if (email != null) {
                  User.findOne({ email: email }, (err, result) => {
                    console.log("res in fb login: " + JSON.stringify(result));
                    if (result == null) {
                      var date = new Date();
                      var newUser = new User({
                        profilepic: profilepic,
                        devices: {
                          devicetoken: devicetoken,
                          devicetype: devicetype,
                          version: version,
                          lastLoginDevice: devicetype
                        },
                        appversion: appversion,
                        sociallogin: {
                          facebook: {
                            facebookid: facebookid,
                            name: name,
                            email: email,
                            profilepic: profilepic,
                            gender: gender,
                            dob: dob
                          }
                        },
                        lastlogin: date,
                        logintype: "Facebook"
                      });
                      newUser.save((err, result1) => {
                        if (err) reject(err);
                        else {
                          Tweak.find({ userid: result1._id })
                            .count()
                            .exec((err, result2) => {
                              result1.tweakcount = result2;
                              if (result1.tweakcount / 1000 >= 1) {
                                result1.tweakcount =
                                  parseFloat(result1.tweakcount / 1000).toFixed(
                                    1
                                  ) + "k";
                              }
                              resolve(result1);
                            });
                        }
                      });
                    } else {
                      let devices = [];
                      var deviceObj = {};
                      if (!result.devices) {
                        deviceObj.devicetype = devicetype;
                        deviceObj.devicetoken = null;
                        deviceObj.lastLoginDevice = devicetype;
                        devices.push(deviceObj);
                      } else {
                        if (result.devices[0].devicetype) {
                          deviceObj.devicetype = result.devices[0].devicetype;
                        }
                        if (result.devices[0].devicetoken) {
                          deviceObj.devicetoken = result.devices[0].devicetoken;
                        }
                        deviceObj.lastLoginDevice = devicetype;
                        devices.push(deviceObj);
                      }
                      if (devicetype == "web") {
                        var date = new Date();
                        User.update(
                          { _id: result._id },
                          {
                            $set: {
                              devices: devices,
                              appversion: appversion,
                              sociallogin: {
                                facebook: {
                                  facebookid: facebookid,
                                  name: name,
                                  email: email,
                                  profilepic: profilepic,
                                  gender: gender,
                                  dob: dob
                                },
                                twitter: {
                                  twitterid:
                                    result.sociallogin.twitter.twitterid,
                                  name: result.sociallogin.twitter.name,
                                  profilepic:
                                    result.sociallogin.twitter.profilepic,
                                  gender: result.sociallogin.twitter.gender,
                                  dob: result.sociallogin.twitter.dob
                                }
                              },
                              lastlogin: date,
                              logintype: "Facebook"
                            }
                          },
                          (err, result1) => {
                            if (err) reject(err);
                            else {
                              User.findOne({ _id: result._id }).then(res => {
                                Tweak.find({ userid: result._id })
                                  .count()
                                  .exec((err, result1) => {
                                    result.tweakcount = result1;
                                    if (result.tweakcount / 1000 >= 1) {
                                      result.tweakcount =
                                        parseFloat(
                                          result.tweakcount / 1000
                                        ).toFixed(1) + "k";
                                    }
                                    err ? reject(err) : resolve(result);
                                  });
                              });
                            }
                          }
                        );
                      } else {
                        var date = new Date();
                        User.update(
                          { _id: result._id },
                          {
                            $set: {
                              devices: {
                                devicetoken: devicetoken,
                                devicetype: devicetype,
                                version: version,
                                lastLoginDevice: devicetype
                              },
                              appversion: appversion,
                              sociallogin: {
                                facebook: {
                                  facebookid: facebookid,
                                  name: name,
                                  email: email,
                                  profilepic: profilepic,
                                  gender: gender,
                                  dob: dob
                                },
                                twitter: {
                                  twitterid:
                                    result.sociallogin.twitter.twitterid,
                                  name: result.sociallogin.twitter.name,
                                  profilepic:
                                    result.sociallogin.twitter.profilepic,
                                  gender: result.sociallogin.twitter.gender,
                                  dob: result.sociallogin.twitter.dob
                                }
                              },
                              lastlogin: date,
                              logintype: "Facebook"
                            }
                          },
                          (err, result1) => {
                            if (err) reject(err);
                            else {
                              User.findOne({ _id: result._id }).then(res => {
                                Tweak.find({ userid: result._id })
                                  .count()
                                  .exec((err, result1) => {
                                    result.tweakcount = result1;
                                    if (result.tweakcount / 1000 >= 1) {
                                      result.tweakcount =
                                        parseFloat(
                                          result.tweakcount / 1000
                                        ).toFixed(1) + "k";
                                    }
                                    err ? reject(err) : resolve(result);
                                  });
                              });
                            }
                          }
                        );
                      }
                    }
                  });
                } else {
                  var date = new Date();
                  var newUser = new User({
                    profilepic: profilepic,
                    devices: {
                      devicetoken: devicetoken,
                      devicetype: devicetype,
                      version: version,
                      lastLoginDevice: devicetype
                    },
                    appversion: appversion,
                    sociallogin: {
                      facebook: {
                        facebookid: facebookid,
                        name: name,
                        email: email,
                        profilepic: profilepic,
                        gender: gender,
                        dob: dob
                      }
                    },
                    lastlogin: date,
                    logintype: "Facebook"
                  });
                  newUser.save((err, result) => {
                    if (err) reject(err);
                    else {
                      Tweak.find({ userid: result._id })
                        .count()
                        .exec((err, result2) => {
                          result.tweakcount = result2;
                          if (result.tweakcount / 1000 >= 1) {
                            result.tweakcount =
                              parseFloat(result.tweakcount / 1000).toFixed(1) +
                              "k";
                          }
                          resolve(result);
                        });
                    }
                  });
                }
              } else {
                let devices = [];
                var deviceObj = {};
                if (!res.devices) {
                  deviceObj.devicetype = devicetype;
                  deviceObj.devicetoken = null;
                  deviceObj.lastLoginDevice = devicetype;
                  devices.push(deviceObj);
                } else {
                  if (res.devices[0].devicetype) {
                    deviceObj.devicetype = res.devices[0].devicetype;
                  }
                  if (res.devices[0].devicetoken) {
                    deviceObj.devicetoken = res.devices[0].devicetoken;
                  }
                  deviceObj.lastLoginDevice = devicetype;
                  devices.push(deviceObj);
                }
                if (devicetype == "web") {
                  var date = new Date();
                  User.update(
                    { _id: res._id },
                    {
                      $set: {
                        devices: devices,
                        appversion: appversion,
                        sociallogin: {
                          facebook: {
                            facebookid: facebookid,
                            name: name,
                            email: email,
                            profilepic: profilepic,
                            gender: gender,
                            dob: dob
                          },
                          twitter: {
                            twitterid: res.sociallogin.twitter.twitterid,
                            name: res.sociallogin.twitter.name,
                            profilepic: res.sociallogin.twitter.profilepic,
                            gender: res.sociallogin.twitter.gender,
                            dob: res.sociallogin.twitter.dob
                          }
                        },
                        lastlogin: date,
                        logintype: "Facebook"
                      }
                    },
                    (err, result) => {
                      if (err) reject(err);
                      else {
                        User.findOne({ _id: res._id }).then(res => {
                          Tweak.find({ userid: res._id })
                            .count()
                            .exec((err, result1) => {
                              res.tweakcount = result1;
                              if (res.tweakcount / 1000 >= 1) {
                                res.tweakcount =
                                  parseFloat(res.tweakcount / 1000).toFixed(1) +
                                  "k";
                              }
                              err ? reject(err) : resolve(res);
                            });
                        });
                      }
                    }
                  );
                } else {
                  var date = new Date();
                  User.update(
                    { _id: res._id },
                    {
                      $set: {
                        devices: {
                          devicetoken: devicetoken,
                          devicetype: devicetype,
                          version: version,
                          lastLoginDevice: devicetype
                        },
                        appversion: appversion,
                        sociallogin: {
                          facebook: {
                            facebookid: facebookid,
                            name: name,
                            email: email,
                            profilepic: profilepic,
                            gender: gender,
                            dob: dob
                          },
                          twitter: {
                            twitterid: res.sociallogin.twitter.twitterid,
                            name: res.sociallogin.twitter.name,
                            profilepic: res.sociallogin.twitter.profilepic,
                            gender: res.sociallogin.twitter.gender,
                            dob: res.sociallogin.twitter.dob
                          }
                        },
                        lastlogin: date,
                        logintype: "Facebook"
                      }
                    },
                    (err, result) => {
                      if (err) reject(err);
                      else {
                        User.findOne({ _id: res._id }).then(res => {
                          Tweak.find({ userid: res._id })
                            .count()
                            .exec((err, result1) => {
                              res.tweakcount = result1;
                              if (res.tweakcount / 1000 >= 1) {
                                res.tweakcount =
                                  parseFloat(res.tweakcount / 1000).toFixed(1) +
                                  "k";
                              }
                              err ? reject(err) : resolve(res);
                            });
                        });
                      }
                    }
                  );
                }
              }
            }
          );
        }
      });
    },
    linkFacebook: (
      root,
      { _id, facebookid, name, email, profilepic, gender, dob }
    ) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: _id }, (err, res) => {
          if (res == null) {
            reject("User does not exist");
          } else {
            if (facebookid == null || facebookid == "")
              reject("Facebook id is mandatory.");
            else {
              User.findOne(
                { "sociallogin.facebook.facebookid": facebookid },
                (err, res) => {
                  if (res == null) {
                    User.findOne({ _id: _id }, (err, res) => {
                      User.update(
                        { _id: _id },
                        {
                          $set: {
                            sociallogin: {
                              facebook: {
                                facebookid: facebookid,
                                name: name,
                                email: email,
                                profilepic: profilepic,
                                gender: gender,
                                dob: dob
                              },
                              twitter: {
                                twitterid: res.sociallogin.twitter.twitterid,
                                name: res.sociallogin.twitter.name,
                                profilepic: res.sociallogin.twitter.profilepic,
                                gender: res.sociallogin.twitter.gender,
                                dob: res.sociallogin.twitter.dob
                              }
                            }
                          }
                        },
                        (err, result) => {
                          err
                            ? reject(err)
                            : resolve(User.findOne({ _id: _id }));
                        }
                      );
                    });
                  } else {
                    User.update(
                      { _id: res._id },
                      {
                        $set: {
                          sociallogin: {
                            facebook: {
                              facebookid: null,
                              name: null,
                              email: null,
                              profilepic: null,
                              gender: null,
                              dob: null
                            },
                            twitter: {
                              twitterid: res.sociallogin.twitter.twitterid,
                              name: res.sociallogin.twitter.name,
                              profilepic: res.sociallogin.twitter.profilepic,
                              gender: res.sociallogin.twitter.gender,
                              dob: res.sociallogin.twitter.dob
                            }
                          }
                        }
                      },
                      (err, result) => {
                        User.findOne({ _id: _id }, (err, res) => {
                          User.update(
                            { _id: _id },
                            {
                              $set: {
                                sociallogin: {
                                  facebook: {
                                    facebookid: facebookid,
                                    name: name,
                                    email: email,
                                    profilepic: profilepic,
                                    gender: gender,
                                    dob: dob
                                  },
                                  twitter: {
                                    twitterid:
                                      res.sociallogin.twitter.twitterid,
                                    name: res.sociallogin.twitter.name,
                                    profilepic:
                                      res.sociallogin.twitter.profilepic,
                                    gender: res.sociallogin.twitter.gender,
                                    dob: res.sociallogin.twitter.dob
                                  }
                                }
                              }
                            },
                            (err, result) => {
                              err
                                ? reject(err)
                                : resolve(User.findOne({ _id: _id }));
                            }
                          );
                        });
                      }
                    );
                  }
                }
              );
            }
          }
        });
      });
    },
    linkTwitter: (
      root,
      { _id, twitterid, username, profilepic, gender, dob }
    ) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: _id }, (err, res) => {
          if (res == null) {
            reject("User does not exist");
          } else {
            if (twitterid == null || twitterid == "")
              reject("Twitterid is mandatory.");
            else {
              User.findOne(
                { "sociallogin.twitter.twitterid": twitterid },
                (err, res) => {
                  if (res == null) {
                    User.findOne({ _id: _id }, (err, res) => {
                      User.update(
                        { _id: _id },
                        {
                          $set: {
                            sociallogin: {
                              twitter: {
                                twitterid: twitterid,
                                name: username,
                                profilepic: profilepic,
                                gender: gender,
                                dob: dob
                              },
                              facebook: {
                                facebookid: res.sociallogin.facebook.facebookid,
                                name: res.sociallogin.facebook.name,
                                email: res.sociallogin.facebook.email,
                                profilepic: res.sociallogin.facebook.profilepic,
                                gender: res.sociallogin.facebook.gender,
                                dob: res.sociallogin.facebook.dob
                              }
                            }
                          }
                        },
                        (err, result) => {
                          err
                            ? reject(err)
                            : resolve(User.findOne({ _id: _id }));
                        }
                      );
                    });
                  } else {
                    User.update(
                      { _id: res._id },
                      {
                        $set: {
                          sociallogin: {
                            twitter: {
                              twitterid: null,
                              name: null,
                              profilepic: null,
                              gender: null,
                              dob: null
                            },
                            facebook: {
                              facebookid: res.sociallogin.facebook.facebookid,
                              name: res.sociallogin.facebook.name,
                              email: res.sociallogin.facebook.email,
                              profilepic: res.sociallogin.facebook.profilepic,
                              gender: res.sociallogin.facebook.gender,
                              dob: res.sociallogin.facebook.dob
                            }
                          }
                        }
                      },
                      (err, result) => {
                        User.findOne({ _id: _id }, (err, res) => {
                          User.update(
                            { _id: _id },
                            {
                              $set: {
                                sociallogin: {
                                  twitter: {
                                    twitterid: twitterid,
                                    name: username,
                                    profilepic: profilepic,
                                    gender: gender,
                                    dob: dob
                                  },
                                  facebook: {
                                    facebookid:
                                      res.sociallogin.facebook.facebookid,
                                    name: res.sociallogin.facebook.name,
                                    email: res.sociallogin.facebook.email,
                                    profilepic:
                                      res.sociallogin.facebook.profilepic,
                                    gender: res.sociallogin.facebook.gender,
                                    dob: res.sociallogin.facebook.dob
                                  }
                                }
                              }
                            },
                            (err, result) => {
                              err
                                ? reject(err)
                                : resolve(User.findOne({ _id: _id }));
                            }
                          );
                        });
                      }
                    );
                  }
                }
              );
            }
          }
        });
      });
    },
    linkEmail: (root, { _id, username, password }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: _id }, (err, res) => {
          if (res == null) {
            reject("User does not exist");
          } else {
            User.findOne({
              $or: [{ email: username }, { username: username }]
            }).then(user => {
              if (user == undefined) {
                reject(new Error("Invalid username or password "));
              } else {
                if (user.password == password) {
                  User.update(
                    { _id: user._id },
                    { $set: { username: null, email: null, password: null } },
                    (err, result) => {
                      User.update(
                        { _id: _id },
                        {
                          $set: {
                            username: user.username,
                            email: user.email,
                            password: user.password,
                            linkemailuserid: user._id
                          }
                        },
                        (err, result) => {
                          err
                            ? reject(err)
                            : resolve(User.findOne({ _id: _id }));
                        }
                      );
                    }
                  );
                } else {
                  reject(new Error("Invalid username or password "));
                }
              }
            });
          }
        });
      });
    },
    unlinkEmail: (root, { _id }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: _id }, (err, res) => {
          if (res == null) reject("User does not exist...");
          else {
            if (res.linkemailuserid != null) {
              User.findOne({ _id: res.linkemailuserid }, (err, res1) => {
                if (res1.password == null) {
                  User.update(
                    { _id: res1._id },
                    {
                      $set: {
                        username: res.username,
                        email: res.email,
                        password: res.password
                      }
                    },
                    (err, result) => {
                      User.update(
                        { _id: _id },
                        {
                          $set: {
                            username: null,
                            email: null,
                            password: null,
                            linkemailuserid: null
                          }
                        },
                        (err, result) => {
                          err
                            ? reject(err)
                            : resolve(User.findOne({ _id: _id }));
                        }
                      );
                    }
                  );
                } else {
                  var newUser = new User({
                    username: res.username,
                    email: res.email,
                    password: res.password
                  });
                  newUser.save((err, result1) => {
                    User.update(
                      { _id: _id },
                      {
                        $set: {
                          username: null,
                          email: null,
                          password: null,
                          linkemailuserid: null
                        }
                      },
                      (err, result) => {
                        err ? reject(err) : resolve(User.findOne({ _id: _id }));
                      }
                    );
                  });
                }
              });
            } else {
              var newUser = new User({
                username: res.username,
                email: res.email,
                password: res.password
              });
              newUser.save((err, result1) => {
                User.update(
                  { _id: _id },
                  {
                    $set: {
                      username: null,
                      email: null,
                      password: null,
                      linkemailuserid: null
                    }
                  },
                  (err, result) => {
                    err ? reject(err) : resolve(User.findOne({ _id: _id }));
                  }
                );
              });
            }
          }
        });
      });
    },
    unlinkTwitter: (root, { _id }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: _id }, (err, res) => {
          if (res == null) reject("User does not exist...");
          else {
            User.update(
              { _id: _id },
              {
                $set: {
                  sociallogin: {
                    twitter: {
                      twitterid: null,
                      name: null,
                      profilepic: null,
                      gender: null,
                      dob: null
                    },
                    facebook: {
                      facebookid: res.sociallogin.facebook.facebookid,
                      name: res.sociallogin.facebook.name,
                      email: res.sociallogin.facebook.email,
                      profilepic: res.sociallogin.facebook.profilepic,
                      gender: res.sociallogin.facebook.gender,
                      dob: res.sociallogin.facebook.dob
                    }
                  }
                }
              },
              (err, result) => {
                err ? reject(err) : resolve(User.findOne({ _id: _id }));
              }
            );
          }
        });
      });
    },
    unlinkFacebook: (root, { _id }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: _id }, (err, res) => {
          if (res == null) reject("User does not exist...");
          else {
            User.update(
              { _id: res._id },
              {
                $set: {
                  sociallogin: {
                    facebook: {
                      facebookid: null,
                      name: null,
                      email: null,
                      profilepic: null,
                      gender: null,
                      dob: null
                    },
                    twitter: {
                      twitterid: res.sociallogin.twitter.twitterid,
                      name: res.sociallogin.twitter.name,
                      profilepic: res.sociallogin.twitter.profilepic,
                      gender: res.sociallogin.twitter.gender,
                      dob: res.sociallogin.twitter.dob
                    }
                  }
                }
              },
              (err, result) => {
                err ? reject(err) : resolve(User.findOne({ _id: _id }));
              }
            );
          }
        });
      });
    },
    updateUser: (
      root,
      {
        _id,
        type,
        name,
        username,
        profilepic,
        gender,
        age,
        biodata,
        location,
        website,
        userid,
        value,
        searchstring,
        searchType,
        notification
      }
    ) => {
      return new Promise((resolve, reject) => {
        if (type == "Profile") {
          if (username == null || username == "")
            reject("Username is mandatory.");
          else {
            User.findOne({ _id: _id }, (err, res) => {
              if (res == null) reject("User does not exist.");
              else {
                if (res.username == null || res.username == undefined) {
                  User.findOne(
                    {
                      username: { $regex: "^" + username + "$", $options: "$i" }
                    },
                    (err, reslt) => {
                      if (reslt != null && reslt._id != _id)
                        reject("Sorry, this username already exists");
                      else {
                        User.update(
                          { _id },
                          {
                            $set: {
                              name: name,
                              username: username,
                              profilepic: profilepic,
                              gender: gender,
                              age: age,
                              biodata: biodata,
                              location: location,
                              website: website
                            }
                          },
                          (error, result2) => {
                            if (error) reject(error);
                            else {
                              User.findOne({ _id: _id }, (err, result3) => {
                                result3.message =
                                  "Profile updated successfully.";
                                err ? reject(err) : resolve(result3);
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                } else {
                  if (res.username.toLowerCase() == username.toLowerCase()) {
                    User.update(
                      { _id },
                      {
                        $set: {
                          name: name,
                          username: username,
                          profilepic: profilepic,
                          gender: gender,
                          age: age,
                          biodata: biodata,
                          location: location,
                          website: website
                        }
                      },
                      (error, result) => {
                        if (error) reject(error);
                        else {
                          User.findOne({ _id: _id }, (err, result3) => {
                            result3.message = "Profile updated successfully.";
                            err ? reject(err) : resolve(result3);
                          });
                        }
                      }
                    );
                  } else {
                    User.findOne(
                      {
                        username: {
                          $regex: "^" + username + "$",
                          $options: "$i"
                        }
                      },
                      (err, reslt) => {
                        if (reslt != null && reslt._id != _id)
                          reject("Sorry, this username already exists");
                        else {
                          User.update(
                            { _id },
                            {
                              $set: {
                                name: name,
                                username: username,
                                profilepic: profilepic,
                                gender: gender,
                                age: age,
                                biodata: biodata,
                                location: location,
                                website: website
                              }
                            },
                            (error, result2) => {
                              if (error) reject(error);
                              else {
                                User.findOne({ _id: _id }, (err, result3) => {
                                  result3.message =
                                    "Profile updated successfully.";
                                  err ? reject(err) : resolve(result3);
                                });
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              }
            });
          }
        } else if (type == "Follower") {
          User.findOne({ _id: _id }, (err, res) => {
            if (res == null) reject("User does not exist.");
            else {
              User.findOne({ _id: userid }, (err, res1) => {
                if (res1 == null) reject("Following user does not exist.");
                else {
                  var followingArray = [];
                  if (res.following != "") {
                    res.following.map(follow => {
                      followingArray.push(follow);
                    });
                  }
                  if (value == 1) {
                    var index = followingArray.indexOf(userid);
                    if (index == -1) {
                      followingArray.push(userid);
                    }
                    var action = "follow";

                    Notification.findOne({
                      $and: [
                        { userid: userid },
                        { type: action },
                        { fromuserid: _id }
                      ]
                    }).exec((err, not) => {
                      if (not == null) {
                        var alert = res.username + " is now following you";

                        var newNotification = new Notification({
                          userid: userid,
                          alert: alert,
                          fromuserid: _id,
                          type: action
                        });
                        newNotification.save((err, noti) => {});
                        if (res1.notification == "public") {
                          if (res1.devices != null && res1.devices != "")
                            notifi(
                              res1.devices[0].devicetype,
                              res1.devices[0].devicetoken,
                              alert,
                              _id,
                              action,
                              res.profilepic,
                              null,
                              null,
                              null
                            );
                        }
                      } else {
                        var date = new Date();
                        date.setDate(date.getDate());
                        var startDate = moment(not.created);
                        var endDate = moment(date);
                        var hoursDiff = endDate.diff(startDate, "hours");

                        Notification.update(
                          { _id: not._id },
                          { created: date },
                          (err, result) => {}
                        );
                        if (hoursDiff >= 24) {
                          var alert = res.username + " is now following you";
                          if (res1.devices != null && res1.devices != "")
                            notifi(
                              res1.devices[0].devicetype,
                              res1.devices[0].devicetoken,
                              alert,
                              _id,
                              action,
                              res.profilepic,
                              null,
                              null,
                              null
                            );
                        }
                      }
                    });
                  } else if (value == 0) {
                    var index = -1;
                    if (followingArray != "") {
                      for (var i = 0; i < followingArray.length; i++) {
                        if (followingArray[i] == userid) {
                          index = i;
                        }
                      }
                    }
                    if (index > -1) {
                      followingArray.splice(index, 1);
                    }
                  } else reject("Invalid value");

                  User.update(
                    { _id },
                    { $set: { following: followingArray } },
                    (err, result2) => {
                      User.findOne({ _id: _id }, { following: 1 }).exec(
                        (err, following) => {
                          User.update(
                            { _id: _id },
                            {
                              $set: {
                                followingCount: following.following.length
                              }
                            },
                            (err, update) => {}
                          );
                        }
                      );
                      var followersArray = [];
                      if (res1.followers != "") {
                        res1.followers.map(follow => {
                          followersArray.push(follow);
                        });
                      }
                      if (value == 1) {
                        var index = followersArray.indexOf(_id);
                        if (index == -1) {
                          followersArray.push(_id);
                        }
                      } else {
                        var index = -1;
                        if (followersArray != "") {
                          for (var i = 0; i < followersArray.length; i++) {
                            if (followersArray[i] == _id) {
                              index = i;
                            }
                          }
                        }
                        if (index > -1) {
                          followersArray.splice(index, 1);
                        }
                      }
                      User.update(
                        { _id: userid },
                        { $set: { followers: followersArray } },
                        (err, result2) => {
                          User.findOne({ _id: userid }, { followers: 1 }).exec(
                            (err, followers) => {
                              User.update(
                                { _id: userid },
                                {
                                  $set: {
                                    followersCount: followers.followers.length
                                  }
                                },
                                (err, update) => {}
                              );
                            }
                          );
                          User.findOne({ _id: userid }, (err, result3) => {
                            var index = result3.followers.indexOf(_id);
                            if (index > -1) result3.isfollowing = 1;
                            else result3.isfollowing = 0;

                            result3.message = "User updated successfully.";
                            err ? reject(err) : resolve(result3);
                          });
                        }
                      );
                    }
                  );
                }
              });
            }
          });
        } else if (type == "Settings") {
          User.findOne({ _id: _id }, (err, res) => {
            if (res == null) reject("User does not exist.");
            else {
              if (
                notification == "public" ||
                notification == "off" ||
                notification == "known"
              ) {
                User.update(
                  { _id: _id },
                  { $set: { notification: notification } },
                  (err, result) => {
                    User.findOne({ _id: _id }, (err, result3) => {
                      result3.message = "Settings updated successfully.";
                      err ? reject(err) : resolve(result3);
                    });
                  }
                );
              } else {
                reject("Invalid settings");
              }
            }
          });
        } else if (type == "Search") {
          User.findOne({ _id: _id }, (err, res) => {
            if (res == null) reject("User does not exist.");
            else {
              var searchArray = [];
              var count = 0;
              if (res.searchhistory != "") {
                res.searchhistory.map(search => {
                  if (search.searchstring != null) {
                    if (
                      search.searchstring.toLowerCase() ==
                        searchstring.toLowerCase() &&
                      search.searchType == searchType
                    )
                      count++;
                    searchArray.push(search);
                  }
                });
              }
              var search = {
                searchstring: searchstring,
                searchType: searchType
              };

              if (count == 0) {
                searchArray.push(search);
                User.update(
                  { _id: _id },
                  { $set: { searchhistory: searchArray } },
                  (err, result2) => {
                    User.findOne({ _id: _id }, (err, result3) => {
                      result3.message = "Settings updated successfully.";
                      err ? reject(err) : resolve(result3);
                    });
                  }
                );
              } else {
                User.findOne({ _id: _id }, (err, result3) => {
                  result3.message = "Settings updated successfully.";
                  err ? reject(err) : resolve(result3);
                });
              }
            }
          });
        } else reject("Invalid type");
      });
    },
    updateStaffUser: (root, { _id, name, username, role, email }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: _id }, (err, res) => {
          if (res == null) reject("User does not exist.");
          else {
            User.update(
              { _id },
              {
                $set: {
                  name: name,
                  username: username,
                  email: email,
                  role: role
                }
              },
              (error, result2) => {
                if (error) reject(error);
                else {
                  User.findOne({ _id: _id }, (err, result3) => {
                    result3.message = "Profile updated successfully.";
                    err ? reject(err) : resolve(result3);
                  });
                }
              }
            );
          }
        });
      });
    },
    changePassword: (root, { _id, password }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: _id }, (err, res) => {
          if (err) {
            reject("User was not found");
          } else {
            User.update(
              { _id },
              { $set: { password: password, isFirstLogin: false } },
              (err, result) => {
                if (res.isbloopituser == true)
                  User.update(
                    { _id },
                    { $set: { isbloopituser: false, isFirstLogin: false } },
                    (err, result) => {}
                  );
                err ? reject(err) : resolve(User.findOne({ _id: _id }));
              }
            );
          }
        });
      });
    },
    removeUser: (obj, { _id }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: _id }, (err, user) => {
          if (err || user == null) {
            reject("User was not found");
          } else {
            console.log(user.username);
            user.likes.map((like, key) => {
              Tweak.findOne({ _id: like.tweakid }, (err, like) => {
                console.log("User liked Tweak: " + like.title);
              });
            });
            Tweak.find({ userid: _id }, (err, created) => {
              created.map((create, key) => {
                console.log("User created Tweak: " + create.title);
                create.likes.map((likedUser, key) => {
                  console.log("liked users: " + likedUser);
                });

                User.update(
                  {},
                  { $pull: { likes: { tweakid: create._id } } },
                  { multi: true },
                  (err, like) => {
                    console.log(like);
                  }
                );

                create.bombed.map((bombedUser, key) => {
                  console.log("bombed users: " + bombedUser);
                });
                Comment.find({ tweakid: created._id }, (err, comments) => {
                  comments.map((comment, key) => {
                    console.log("Comments: " + comment.comment);
                  });
                });
                Comment.remove(
                  { tweakid: created._id },
                  { multi: true },
                  (err, comments) => {
                    console.log(comments);
                  }
                );
              });
            });

            Tweak.update(
              {},
              { $pull: { likes: _id } },
              { multi: true },
              (err, like) => {
                console.log(like);
              }
            );
            Tweak.update(
              {},
              { $pull: { bombed: _id } },
              { multi: true },
              (err, like) => {
                console.log(like);
              }
            );
            User.find({ followers: { $in: [_id] } }, (err, followers) => {
              followers.map((follower, key) => {
                console.log("followers: " + follower.username);
              });
            });
            User.update(
              {},
              { $pull: { followers: _id } },
              { multi: true },
              (err, like) => {
                console.log(like);
              }
            );

            User.find({ following: { $in: [_id] } }, (err, following) => {
              following.map((follows, key) => {
                console.log("follower: " + follows.username);
              });
            });

            User.update(
              {},
              { $pull: { following: _id } },
              { multi: true },
              (err, like) => {
                console.log(like);
              }
            );

            Comment.find({ userid: _id }, (err, comments) => {
              comments.map((comment, key) => {
                console.log("My Comments: " + comment.userid);
              });
            });

            Comment.remove({ userid: _id }, (err, comments) => {
              console.log(comments);
            });

            Notification.find({ userid: _id }, (err, notifications) => {
              notifications.map((notification, key) => {
                console.log("Notification: " + notification.alert);
              });
            });

            Notification.remove({ userid: _id }, (err, comments) => {
              console.log(comments);
            });

            Notification.find({ fromuserid: _id }, (err, notifications) => {
              notifications.map((notification, key) => {
                console.log("Self Notification: " + notification.alert);
              });
            });

            Notification.remove({ fromuserid: _id }, (err, comments) => {
              console.log(comments);
            });

            Tweak.find({ bombed: { $in: [_id] } }, (err, bombed) => {
              bombed.map((bomb, key) => {
                console.log("User Bombed: " + bomb.title);
              });
            });
            setTimeout(function() {
              User.remove({ _id: _id }, (err, bombed) => {
                console.log("User: " + bombed);
                resolve(user);
              });
              Tweak.remove({ userid: _id }, (err, bombed) => {
                console.log("Tweaks: " + bombed);
              });
            }, 5000);
          }
        });
      });
    },
    removeStaffUser: (obj, { _id }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: _id }, (err, res) => {
          if (err || res == null) {
            reject("User was not found");
          } else {
            User.update(
              { _id: _id },
              { $set: { isStaffDelete: true } },
              (err, result) => {
                err ? reject(err) : resolve(res);
              }
            );
          }
        });
      });
    },
    updateUserAdmin: (root, { _id, popular, status }) => {
      return new Promise((resolve, reject) => {
        console.log("popular: " + popular);
        User.update(
          { _id: _id },
          { $set: { popular: popular } },
          (err, result) => {
            User.findOne({ _id: _id }, (err, result3) => {
              result3.message = "Updated";
              err ? reject(err) : resolve(result3);
            });
          }
        );
      });
    },
    userFollowPopular: (root, { _id }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: _id }).exec((err, user) => {
          if (err) reject(err);
          else {
            User.find({
              $and: [{ popular: true }, { _id: { $ne: _id } }]
            }).exec((err, res) => {
              if (err) reject(err);
              else {
                _.each(res, function(data1) {
                  User.update(
                    { _id: data1._id },
                    { $addToSet: { followers: _id } },
                    (err, result2) => {}
                  );
                  User.update(
                    { _id },
                    { $addToSet: { following: data1._id } },
                    (err, result2) => {}
                  );
                });
                user.message = "Following all popular users...";
                err ? reject(err) : resolve(user);
              }
            });
          }
        });
      });
    },
    userLogout: (root, { _id }) => {
      return new Promise((resolve, reject) => {
        User.update({ _id: _id }, { $set: { devices: null } }, (err, user) => {
          user.message = "Logged out.";
          err ? reject(err) : resolve(user);
        });
      });
    },
    updateWebCreateVisited: (root, { _id }) => {
      return new Promise((resolve, reject) => {
        User.update(
          { _id: _id },
          { $set: { webCreateVisited: true } },
          (err, user) => {
            user.message = "Updated";
            err ? reject(err) : resolve(User.findOne({ _id: _id }));
          }
        );
      });
    },
    updateQuickbloxid: (root, { _id, quickbloxid }) => {
      return new Promise((resolve, reject) => {
        User.update(
          { _id: _id },
          { $set: { quickbloxid: quickbloxid } },
          (err, user) => {
            user.message = "Updated";
            err ? reject(err) : resolve(User.findOne({ _id: _id }));
          }
        );
      });
    },
    deleteUser: (root, { userids }) => {
      return new Promise((resolve, reject) => {
        if (userids.length == 0) {
          reject("No ids.");
        } else {
          userids.map((_id, key) => {
            User.findOne({ _id: _id }, (err, user) => {
              if (user) {
                console.log(
                  "Deleting User: " +
                    user.username +
                    " quickbloxid: " +
                    user.quickbloxid
                );

                User.remove({ _id: _id }, (err, userDeleted) => {});

                if (user.quickbloxid) {
                  //  var QB = new QuickBlox();
                  //   QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);
                  //  QB.createSession(function(err, result) {
                  //    QB.init(result.token, CREDENTIALS.appId);
                  //
                  //
                  //
                  //    var params = { 'login': "mgitter@gmail.com", 'password': "#Tweak#!"};
                  //     QB.login(params, function(err, quickbloxUser) {
                  //       QB.users.delete(user.quickbloxid, function(err, user){
                  //         if (user) {
                  //           console.log("Quickblox Success: "+JSON.stringify(user));
                  //         } else  {
                  //           console.log("Quickblox Error: "+JSON.stringify(err));
                  //         }
                  //       });
                  //     })
                  //   })

                  setTimeout(function() {
                    var QB = new QuickBlox();
                    QB.init(
                      CREDENTIALS.appId,
                      CREDENTIALS.authKey,
                      CREDENTIALS.authSecret
                    );
                    QB.createSession(function(err, result) {
                      QB.init(result.token, CREDENTIALS.appId);

                      var params = {
                        filter: {
                          field: "id",
                          param: "in",
                          value: [user.quickbloxid]
                        },
                        order: { sort: "desc", field: "id" }
                      };

                      QB.users.listUsers(params, function(err, result) {
                        if (err) {
                          console.log("errMsg ==> ", err);
                        } else {
                          if (result.items[0]) {
                            console.log(
                              "User Object ",
                              result.items[0].user.login
                            );
                            var params = {
                              login: result.items[0].user.login,
                              password: "#Tweak#!"
                            };
                            QB.login(params, function(err, quickbloxUser) {
                              if (quickbloxUser) {
                                console.log(
                                  "login: " + JSON.stringify(quickbloxUser)
                                );
                                QB.users.delete(
                                  parseInt(user.quickbloxid),
                                  function(err, user) {
                                    if (user) {
                                      console.log(
                                        "Quickblox Success: " +
                                          JSON.stringify(user)
                                      );
                                    } else {
                                      console.log(
                                        "Quickblox Error: " +
                                          JSON.stringify(err)
                                      );
                                    }
                                  }
                                );
                              } else {
                                console.log(
                                  "Quickblox Error: " + JSON.stringify(err)
                                );
                              }
                            });
                          }
                        }
                      });
                    });
                  }, 5000 * key);
                }

                // if(user.followers) {
                //   user.followers.map((userId, key) => {
                //     User.findOne({_id: userId},(err, userData) => {
                //       if(userData)
                //         console.log(key+" follower "+userData.username);
                //     })
                //   })
                // }

                User.find({ followers: _id }, (err, followUsers) => {
                  followUsers.map((followUser, key) => {
                    followUser.followers.splice(
                      followUser.followers.indexOf(_id),
                      1
                    );
                    //console.log("followUser: "+followUser.followers.length);
                    User.update(
                      { _id: followUser._id },
                      {
                        $set: {
                          followers: followUser.followers,
                          followersCount: followUser.followers.length
                        }
                      },
                      (err, result1) => {
                        // console.log(key+" followUser "+followUser.followers);
                      }
                    );
                  });
                });

                User.find({ following: _id }, (err, followingUsers) => {
                  followingUsers.map((followingUser, key) => {
                    followingUser.following.splice(
                      followingUser.following.indexOf(_id),
                      1
                    );
                    //console.log("followingUser: "+followingUser.following.length);
                    User.update(
                      { _id: followingUser._id },
                      {
                        $set: {
                          following: followingUser.following,
                          followingCount: followingUser.following.length
                        }
                      },
                      (err, result1) => {
                        // console.log(key+" followingUser "+followingUser.following);
                      }
                    );
                  });
                });

                // if(user.following) {
                //   user.following.map((userId, key) => {
                //     User.findOne({_id: userId},(err, userData) => {
                //       if(userData)
                //         console.log(key+" following "+userData.username);
                //     })
                //   })
                // }

                // if(user.likes) {
                //   user.likes.map((likedTweak, key) => {
                //     Tweak.findOne({_id: likedTweak.tweakid},(err, tweakData) => {
                //       if(tweakData)
                //         console.log(key+" likedTweak "+tweakData.title);
                //     })
                //   })
                // }

                Tweak.find({ likes: _id }, (err, likedTweaks) => {
                  likedTweaks.map((likedTweak, key) => {
                    likedTweak.likes.splice(likedTweak.likes.indexOf(_id), 1);
                    console.log(
                      likedTweak._id + " likedTweak: " + likedTweak.likes.length
                    );
                    Tweak.update(
                      { _id: likedTweak._id },
                      {
                        $set: {
                          likes: likedTweak.likes,
                          likesCount: likedTweak.likes.length
                        }
                      },
                      (err, result1) => {
                        // console.log(key+" followingUser "+followingUser.following);
                      }
                    );
                  });
                });

                Tweak.find({ viewers: _id }, (err, viewedTweaks) => {
                  viewedTweaks.map((viewedTweak, key) => {
                    viewedTweak.viewers.splice(
                      viewedTweak.viewers.indexOf(_id),
                      1
                    );
                    //console.log(viewedTweak._id+" viewedTweak: "+viewedTweak.viewers);
                    Tweak.update(
                      { _id: viewedTweak._id },
                      { $set: { viewers: viewedTweak.viewers } },
                      (err, result1) => {
                        // console.log(key+" followingUser "+followingUser.following);
                      }
                    );
                  });
                });

                Tweak.find({ bombed: _id }, (err, bombedTweaks) => {
                  bombedTweaks.map((bombedTweak, key) => {
                    bombedTweak.bombed.splice(
                      bombedTweak.bombed.indexOf(_id),
                      1
                    );
                    //console.log(bombedTweak._id+" bombedTweak: "+bombedTweak.bombed.length);
                    Tweak.update(
                      { _id: bombedTweak._id },
                      {
                        $set: {
                          bombed: bombedTweak.bombed,
                          bombedCount: bombedTweak.bombed.length
                        }
                      },
                      (err, result1) => {
                        // console.log(key+" followingUser "+followingUser.following);
                      }
                    );
                  });
                });

                Notification.remove(
                  { fromuserid: _id },
                  (err, notfications) => {}
                );

                // Notification.find({userid: _id},(err, notfications) => {
                //   notfications.map((notfication, key) => {
                //     console.log(key+" notfication "+notfication.alert);
                //   })
                // })

                Comment.find({ userid: _id }, (err, comments) => {
                  Comment.remove({ userid: _id }, (err, deleted) => {
                    comments.map((comment, key) => {
                      Comment.find({ tweakid: comment.tweakid })
                        .count()
                        .exec((err, commentsCount) => {
                          //console.log("commentsCount: "+commentsCount);
                          Tweak.update(
                            { _id: comment.tweakid },
                            { $set: { commentsCount: commentsCount } },
                            (err, result1) => {
                              // console.log(key+" followingUser "+followingUser.following);
                            }
                          );
                        });
                      console.log(key + " comment " + comment.tweakid);
                    });
                  });
                });

                Tweak.find({ "usertag.user": _id }, (err, taggedTweaks) => {
                  taggedTweaks.map((taggedTweak, key) => {
                    var index = -1;
                    taggedTweak.usertag.map((tags, key) => {
                      if (tags.user == _id) {
                        taggedTweak.usertag.splice(key, 1);
                        Tweak.update(
                          { _id: taggedTweak._id },
                          { $set: { usertag: taggedTweak.usertag } },
                          (err, result1) => {
                            // console.log(key+" followingUser "+followingUser.following);
                          }
                        );
                        //console.log(key+" taggedTweak "+taggedTweak._id);
                      }
                    });
                  });
                });

                Tweak.find({ "flagged.user": _id }, (err, flaggedTweaks) => {
                  flaggedTweaks.map((flaggedTweak, key) => {
                    flaggedTweak.flagged.map((flagged, key) => {
                      if (flagged.user == _id) {
                        flaggedTweak.flagged.splice(key, 1);
                        Tweak.update(
                          { _id: flaggedTweak._id },
                          { $set: { flagged: flaggedTweak.flagged } },
                          (err, result1) => {
                            // console.log(key+" followingUser "+followingUser.following);
                            Tweak.findOne({
                              $and: [
                                { userid: flaggedTweak.userid },
                                { flagged: { $ne: [] } }
                              ]
                            })
                              .count()
                              .exec((err, flaggedcount) => {
                                User.update(
                                  { _id: flaggedTweak.userid },
                                  { $set: { flaggedcount: flaggedcount } },
                                  (err, update) => {}
                                );
                              });
                          }
                        );
                      }
                    });
                    console.log(key + " flaggedTweak " + flaggedTweak._id);
                  });
                });

                Tweak.find({ userid: _id }, (err, createdTweaks) => {
                  Tweak.remove({ userid: _id }, (err, createdTweaks) => {});

                  createdTweaks.map((createdTweak, key) => {
                    User.find(
                      { _id: createdTweak.likes },
                      (err, likedUsers) => {
                        likedUsers.map((likedUser, key) => {
                          likedUser.likes.map((likes, key) => {
                            if (likes.tweakid == createdTweak._id) {
                              likedUser.likes.splice(key, 1);
                              User.update(
                                { _id: likedUser._id },
                                {
                                  $set: {
                                    likes: likedUser.likes,
                                    likesCount: likedUser.likes.length
                                  }
                                },
                                (err, result1) => {
                                  //console.log(JSON.stringify(result1));
                                }
                              );
                            }
                          });
                          console.log(key + " likedUser " + likedUser._id);
                        });
                      }
                    );

                    User.find(
                      { _id: createdTweak.bombed },
                      (err, bombedUsers) => {
                        bombedUsers.map((bombedUser, key) => {
                          User.update(
                            { _id: bombedUser._id },
                            {
                              $set: { bombedCount: bombedUser.bombedCount - 1 }
                            },
                            (err, result1) => {
                              //console.log(JSON.stringify(result1));
                            }
                          );
                          console.log(key + " bombedUser " + bombedUser._id);
                        });
                      }
                    );
                  });
                });
                if (userids.length == key + 1)
                  err ? reject(err) : resolve({ message: "Deleted..." });
              } else {
                if (userids.length == key + 1)
                  err ? reject(err) : resolve({ message: "Deleted..." });
              }
            });
          });
        }
      });
    },
    suspendUser: (root, { userids }) => {
      return new Promise((resolve, reject) => {
        console.log("userids are:" + JSON.stringify(userids));
        if (userids.length == 0) {
          console.log("No ids found.");
        } else {
          userids.map((userId, key) => {
            User.findOne({ _id: userId }, (err, user) => {
              if (user) {
                User.update(
                  { _id: userId },
                  { $set: { status: 2 } },
                  (err, result) => {
                    resolve({ message: "user suspended" });
                  }
                );
              }
            });
          });
        }
      });
    },
    makeUserActive: (root, { userid }) => {
      return new Promise((resolve, reject) => {
        User.update({ _id: userid }, { $set: { status: 1 } }, (err, res) => {
          resolve({ message: "User is Active now " });
        });
      });
    },

    // Admin notifications resolvers
    addNotification: (
      root,
      {
        users,
        notificationText,
        notificationUserType,
        notificationType,
        scheduledTime,
        isDraft,
        status
      }
    ) => {
      return new Promise((resolve, reject) => {
        var newAdminNotification = new AdminNotification({
          users: users,
          notificationText: notificationText,
          notificationUserType: notificationUserType,
          notificationType: notificationType,
          scheduledTime: scheduledTime,
          isDraft: isDraft,
          status: status
        });
        console.log(
          "%1 newAdminNotification: " + JSON.stringify(newAdminNotification)
        );
        newAdminNotification.save((err, result) => {
          console.log("%2 result: " + JSON.stringify(result));
          if (notificationUserType == "AllUsers" && !isDraft) {
            console.log(
              "%3 notificationUserType is all users and not isdraft "
            );
            //  Sending notification for ios and android users irrespective of devicetype
            //User.find({ $and: [ {username: {$ne: null}},{devices:{$ne:[]}},{devices:{$ne:null}} ,{'devices.devicetoken':{$ne:"(null)"}},{$or: [{'devices.devicetype':'ios'},{'devices.devicetype':'android'}]}] },{_id: 1})
            User.find(
              {
                $and: [
                  { username: { $ne: null } },
                  { devices: { $ne: [] } },
                  { devices: { $ne: null } },
                  { "devices.devicetoken": { $ne: "(null)" } }
                ]
              },
              { _id: 1 }
            ).exec((err, users) => {
              var length = users.length;
              console.log("No. of users with devices: " + length);
              var userArray = [];
              users.map((user, key) => {
                userArray.push({ user: user._id });
              });
              var len = userArray.length;
              console.log("users found: " + len);
              AdminNotification.update(
                { _id: result._id },
                { $set: { users: userArray } }
              ).exec((err, updated) => {
                if (err) {
                  console.log(
                    "error in updation of AdminNotification user: " + err
                  );
                } else {
                  if (notificationType == "Instant") {
                    //console.log("%7 result: "+JSON.stringify(result));
                    AdminNotification.update(
                      { _id: result._id },
                      { $set: { status: "Processed" } }
                    ).exec((err, updated) => {});

                    AdminNotification.findOne({ _id: result._id })
                      .populate("users.user", "devices")
                      .exec((err, result) => {
                        //console.log(" AdminNotification.findOne result: "+JSON.stringify(result.users));
                        var rand = (Math.random() + 1)
                          .toString(36)
                          .substring(2, 8);
                        var start = 0;
                        var limit = 200;
                        var interval = setInterval(function() {
                          var userData = result.users;
                          //console.log("users for mapping: "+JSON.stringify(userData));
                          users = userData.slice(start, limit);
                          console.log(
                            "start: " +
                              start +
                              "  limit: " +
                              limit +
                              "  users length: " +
                              users.length
                          );
                          start = limit;
                          limit = start + 200;
                          if (users.length > 0) {
                            users.map((user, key1) => {
                              //console.log("%%%% single user data: %%%: "+user.user._id);
                              var newNotification = new Notification({
                                userid: user.user._id,
                                alert: result.notificationText,
                                fromuserid: null,
                                type: "AdminNotification"
                              });
                              newNotification.save((err, noti) => {});

                              //if( user.user.devices.length>0) {
                              //console.log("user.user.devices: "+JSON.stringify(user.user.devices))
                              if (user.user.devices) {
                                //console.log("sending the notifications")
                                adminNotify(
                                  "campaign_" + rand,
                                  user.user.devices[0].devicetype,
                                  user.user.devices[0].devicetoken,
                                  result.notificationText,
                                  "AdminNotification",
                                  user._id
                                );
                              }
                              //}
                              else {
                                //console.log("coming to else for updation")
                                AdminNotification.update(
                                  { "users._id": user._id },
                                  {
                                    $set: {
                                      "users.$.status": "Failed",
                                      "users.$.sentTime": new Date(),
                                      "users.$.errorMessage":
                                        "Device Not Linked",
                                      "users.$.devicetype": "No Device"
                                    }
                                  }
                                ).exec((err, updated) => {
                                  console.log(
                                    "final data: " + JSON.stringify(updated)
                                  );
                                });
                              }
                            });
                          } else {
                            clearInterval(interval);
                            //resolve(userData);
                          }
                        }, 15000);
                        //console.log("%7 result: "+JSON.stringify(result));
                      });
                  }
                }
              });
            });
          } else if (notificationType == "Instant" && !isDraft) {
            console.log("ohhhh coming to selected users and instant");
            AdminNotification.update(
              { _id: result._id },
              { $set: { status: "Processed" } }
            ).exec((err, updated) => {});
            AdminNotification.findOne({ _id: result._id })
              .populate("users.user", "devices")
              .exec((err, result) => {
                var rand = (Math.random() + 1).toString(36).substring(2, 8);
                result.users.map((user, key1) => {
                  var newNotification = new Notification({
                    userid: user.user._id,
                    alert: result.notificationText,
                    fromuserid: null,
                    type: "AdminNotification"
                  });
                  newNotification.save((err, noti) => {});

                  if (user.user.devices) {
                    //console.log("result: " + user.user.devices[0].devicetoken);
                    adminNotify(
                      "campaign_" + rand,
                      user.user.devices[0].devicetype,
                      user.user.devices[0].devicetoken,
                      result.notificationText,
                      "AdminNotification",
                      user._id
                    );
                  } else {
                    AdminNotification.update(
                      { "users._id": user._id },
                      {
                        $set: {
                          "users.$.status": "Failed",
                          "users.$.sentTime": new Date(),
                          "users.$.errorMessage": "Device Not Linked",
                          "users.$.devicetype": "No Device"
                        }
                      }
                    ).exec((err, updated) => {});
                  }
                });
              });
          }
          err ? reject(err) : resolve(result);
        });
      });
    },
    editAdminNotification: (
      root,
      {
        _id,
        users,
        notificationText,
        notificationUserType,
        notificationType,
        scheduledTime,
        isDraft
      }
    ) => {
      return new Promise((resolve, reject) => {
        AdminNotification.update(
          { _id: _id },
          {
            $set: {
              users: users,
              notificationText: notificationText,
              notificationUserType: notificationUserType,
              notificationType: notificationType,
              scheduledTime: scheduledTime,
              isDraft: isDraft
            }
          },
          (err, result) => {
            AdminNotification.findOne({ _id: _id }, (err, result) => {
              result.message = "Updated";
              err ? reject(err) : resolve(result);
            });
          }
        );
      });
    },
    deleteAdminNotification: (root, { _id }) => {
      return new Promise((resolve, reject) => {
        AdminNotification.findOne({ _id: _id }).exec((err, res) => {
          if (res == null) reject("Notification did not found");
          else {
            AdminNotification.remove({ _id: _id }, (err, result) => {
              err ? reject(err) : resolve(result);
            });
          }
        });
      });
    },
    // category resolvers
    addCategory: (root, { _id, categoryname }) => {
      return new Promise((resolve, reject) => {
        var newCategory = new Category({ categoryname: categoryname });
        newCategory.save((err, result) => {
          err ? reject(err) : resolve(result);
        });
      });
    },
    editCategory: (root, { _id, categoryname }) => {
      return new Promise((resolve, reject) => {
        Category.update(
          { _id: _id },
          { $set: { categoryname: categoryname } },
          (err, result) => {
            Category.findOne({ _id: _id }, (err, category) => {
              err ? reject(err) : resolve(category);
            });
          }
        );
      });
    },
    deleteCategory: (root, { _id }) => {
      return new Promise((resolve, reject) => {
        Category.remove({ _id: _id }, (err, result) => {
          Category.findOne({ _id: _id }, (err, category) => {
            err ? reject(err) : resolve(category);
          });
        });
      });
    },
    //Clipper resolvers
    addClipper: (root, { videoUrl, imageUrl }) => {
      return new Promise((resolve, reject) => {
        var newClipper = new Clipper({
          videoUrl: videoUrl,
          imageUrl: imageUrl
        });
        newClipper.save((err, clipper) => {
          err ? reject(err) : resolve(clipper);
        });
      });
    },
    // comment resolvers
    addComment: (
      root,
      { _id, tweakid, commenttype, commentUrl, comment, userid }
    ) => {
      return new Promise((resolve, reject) => {
        Tweak.findOne({ _id: tweakid }).exec((err, resl) => {
          if (resl == null) reject("Tweak does not exist.");
          else {
            User.findOne({ _id: userid }).exec((err, resul) => {
              if (resul == null) reject("User does not exist.");
              else {
                var newComment = new Comment({
                  tweakid: tweakid,
                  commenttype: commenttype,
                  commentUrl: commentUrl,
                  comment: comment,
                  userid: userid
                });
                newComment.save((err, res) => {
                  if (resl.userid != userid) {
                    var action = "comment";

                    var alert = resul.username + " commented on your Tweak";

                    var newNotification = new Notification({
                      userid: resl.userid,
                      alert: alert,
                      fromuserid: userid,
                      tweakid: tweakid,
                      type: action,
                      commentid: res._id
                    });
                    newNotification.save((err, noti) => {});
                    User.findOne({ _id: resl.userid }).exec((err, dtoken) => {
                      if (dtoken.notification == "public") {
                        if (dtoken.devices != null && dtoken.devices != "")
                          notifi(
                            dtoken.devices[0].devicetype,
                            dtoken.devices[0].devicetoken,
                            alert,
                            userid,
                            action,
                            resul.profilepic,
                            resl.tweakimage,
                            resl.image,
                            tweakid
                          );
                      } else if (dtoken.notification == "known") {
                        if (
                          dtoken.followers.indexOf(userid) > -1 ||
                          dtoken.following.indexOf(userid) > -1
                        ) {
                          if (dtoken.devices != null && dtoken.devices != "")
                            notifi(
                              dtoken.devices[0].devicetype,
                              dtoken.devices[0].devicetoken,
                              alert,
                              userid,
                              action,
                              resul.profilepic,
                              resl.tweakimage,
                              resl.image,
                              tweakid
                            );
                        }
                      }
                    });
                  }

                  Comment.find({ tweakid: tweakid })
                    .count()
                    .exec((err, count) => {
                      Tweak.update(
                        { _id: tweakid },
                        { $set: { commentsCount: count } },
                        (err, result) => {
                          res.commentCount = count;
                          var commentCount = count / 1000;
                          if (commentCount >= 1) {
                            res.commentCount =
                              parseFloat(commentCount).toFixed(1) + "k";
                          }

                          res.username = resul.username;
                          res.profilepic = resul.profilepic;
                          err ? reject(err) : resolve(res);
                        }
                      );
                    });
                });
              }
            });
          }
        });
      });
    },
    deleteComment: (root, { _id, userid }) => {
      return new Promise((resolve, reject) => {
        Notification.remove({ commentid: _id }, (err, result) => {});
        Comment.findOne({ _id: _id }).exec((err, res) => {
          if (res == null) reject("Comment did not found");
          else {
            if (userid == res.userid) {
              Comment.remove({ _id: _id }, (err, result) => {
                Tweak.findOne({ _id: res.tweakid }).exec((err, dec) => {
                  Comment.find({ tweakid: res.tweakid })
                    .count()
                    .exec((err, count) => {
                      Tweak.update(
                        { _id: res.tweakid },
                        { $set: { commentsCount: count } },
                        (err, res1) => {
                          res.commentCount = count;
                          var commentCount = count / 1000;
                          if (commentCount >= 1) {
                            res.commentCount =
                              parseFloat(commentCount).toFixed(1) + "k";
                          }
                          res.message = "Comment deleted";
                          err ? reject(err) : resolve(res);
                        }
                      );
                    });
                });
              });
            } else {
              Tweak.findOne({ _id: res.tweakid }).exec((err, resu) => {
                if (userid == resu.userid) {
                  Comment.remove({ _id: _id }, (err, result) => {
                    Tweak.findOne({ _id: res.tweakid }).exec((err, dec) => {
                      Comment.find({ tweakid: res.tweakid })
                        .count()
                        .exec((err, count) => {
                          Tweak.update(
                            { _id: res.tweakid },
                            { $set: { commentsCount: count } },
                            (err, res1) => {
                              res.commentCount = count;
                              var commentCount = count / 1000;
                              if (commentCount >= 1) {
                                res.commentCount =
                                  parseFloat(commentCount).toFixed(1) + "k";
                              }
                              res.message = "Comment deleted";
                              err ? reject(err) : resolve(res);
                            }
                          );
                        });
                    });
                  });
                } else {
                  reject("Unauthorised access");
                }
              });
            }
          }
        });
      });
    },
    // FeedBack resolvers
    addFeedBack: (root, { userid, subject, message }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ _id: userid }, (err, user) => {
          //console.log("user found %#1: "+user.email+user.username)
          if (!subject) {
            subject = "Feed Back";
          }
          var newFeedBack = new FeedBack({
            userid: userid,
            subject: subject,
            message: message,
            email: user.email,
            username: user.username
          });
          newFeedBack.save((err, res) => {
            //console.log("res to save %#2: "+JSON.stringify(res))
            User.findOne({ _id: userid }, (err, userData) => {
              User.find({ role: "Admin" }, (err, admins) => {
                if (admins.length > 0) {
                  admins.map((admin, key) => {
                    if (userData.email) {
                      var fromMailid = userData.email;
                    } else {
                      var fromMailid = CONFIG_DATA.SENDGRID_EMAIL;
                    }
                    var toMailid = admin.email;
                    var body =
                      "Hello Admins, <br/><br/>A Tweak user has sent you some feedback about the app, please respond to the message in accordingly and in a timely fashion, thanks.<br/><br/>See the message below:   <br/><br/>\t\t\t\t<i><b>" +
                      message +
                      "</b></i> .  <br/><br/><br/>This message generated automatically by the Tweak bot.";
                    sendEmail(fromMailid, toMailid, subject, body, true);
                  });
                } else {
                  console.log("no admin found");
                }
              });
            });
            err ? reject(err) : resolve(res);
          });
        });
      });
    },
    // Adding key resolvers
    addKey: (root, { key }) => {
      return new Promise((resolve, reject) => {
        var newKey = new Key({ key: key });
        newKey.save((err, result) => {
          err ? reject(err) : resolve(result);
        });
      });
    },
    // Notification resolvers
    notifications: (root, { _id }) => {
      return new Promise((resolve, reject) => {
        Notification.update(
          { _id: _id },
          { $set: { isread: true } },
          (err, res) => {
            var result = {};
            result.message = "read";
            resolve(result);
          }
        );
      });
    },
    deleteNotification: (root, { _id, notificationid }) => {
      return new Promise((resolve, reject) => {
        Notification.findOne({ _id: notificationid }).exec((err, res) => {
          if (res == null) reject("Notification did not found");
          else {
            if (res.userid != _id) {
              reject("Unauthorised access");
            } else {
              Notification.remove({ _id: notificationid }, (err, result) => {
                result.message = "Notification deleted.";
                err ? reject(err) : resolve(result);
              });
            }
          }
        });
      });
    },
    // Template messages
    addTemplateMessage: (root, { title, templateText }) => {
      return new Promise((resolve, reject) => {
        var newTemplateMessage = new TemplateMessages({
          title: title,
          templateText: templateText
        });
        newTemplateMessage.save((err, res) => {
          err ? reject(err) : resolve(res);
        });
      });
    },
    updateTemplateMessages: (root, { _id, title, templateText }) => {
      return new Promise((resolve, reject) => {
        TemplateMessages.update(
          { _id: _id },
          { $set: { title: title, templateText: templateText } },
          (err, result) => {
            TemplateMessages.findOne({ _id: _id }, (err, result) => {
              result.message = "Updated";
              err ? reject(err) : resolve(result);
            });
          }
        );
      });
    },
    deleteTemplateMessages: (root, { _id }) => {
      return new Promise((resolve, reject) => {
        TemplateMessages.findOne({ _id: _id }).exec((err, res) => {
          if (res == null) reject("Template did not found");
          else {
            TemplateMessages.remove({ _id: _id }, (err, result) => {
              err ? reject(err) : resolve(result);
            });
          }
        });
      });
    },
    // web resolvers
    addVideo: (root, { _id, title, videourl, imageurl }) => {
      return new Promise((resolve, reject) => {
        var newVideo = new Web({
          title: title,
          videourl: videourl,
          imageurl: imageurl
        });
        newVideo.save((err, res) => {
          err ? reject(err) : resolve(res);
        });
      });
    }
  }
};

module.exports = resolvers;
