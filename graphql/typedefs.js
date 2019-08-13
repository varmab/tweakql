let typeDefs = `

input getTweaksInput
{
    userid:String
    categoryType:String
    start:Int
    categoryid:String 
}
input getAllTweaksByCategoryInput
{
    start:Int
    categoryid:String
}
input getTweaksforWebsiteInput
{
    start:Int
}
input searchUserAdminNotificationInput
{
    searchString:String
}
input getSelectedUsersAdminInput
{
    users:[String]
}
input addTweakInput
{
        userid:String
        title:String
        description:String
        category:String
        image:String
        videourl:String
        starttime:String
        endtime:String
        status:String
        publicScope:String
        savePermission:String
        nsfw:String
        staffpick:String
        usertag:String
        tags:String
        bannerText:String
        bannerColor:String
        bannerXposition:String
        bannerYposition:String
        tweakimage:String
        tweakurl:String
        shareTypes:String
 }
 
 input updateTweakInput 
 {
        _id:String
        categoryType:String
        title:String
        description:String
        category:String
        image:String
        videourl:String
        starttime:String
        endtime:String
        status:String
        publicScope:String
        savePermission:String
        nsfw:String
        staffpick:String
        help:String
        usertag:String
        tags:String
        isbadtweak:String
        userid:String
        viewsCount:String
        likes:String
        bombed:String
        value:String
 }
 input removeTweakInput
 {
     _id:String
     tweakid:String
 }
 input removeTweakAdminInput 
 {
     tweakids:[String]
 }
 input updateTweakAdminInput 
 {
     _id:String
     title:String
     category:String
     status:String
     staffpick:String
 }
 input flagTweakInput
 {
     _id:String
     userid:String
     flaggedType:String
 }
 input shareInput
 {
     _id:String
 }
 input shareDetailsInput
 {
     _id:String
     userid:String
     shareType:String
 }
 input suspendTweakInput
 {
     tweakids:[String]
 }
 input makeActiveTweakInput
{
     tweakid:String
}
input moveCategoryInput
{
     _id:String
     moveId:String
 }
input signUpInput
{
        name:String
        username:String!
        email:String!
        password:String!
        profilepic:String
        gender:String
        age:String
        biodata:String
        location:String
        devicetoken:String
        devicetype:String
        version:String
        appversion:String
}
input StafffUsersignUpInput
{
    name:String
    username:String
    email:String
    password:String
    role:String
    isFirstLogin:String
}
input twitterLoginInput
{
        twitterid:String
        username:String
        profilepic:String
        gender:String
        dob:String
        devicetoken:String
        devicetype:String
        version:String
        appversion:String
}
input facebookLoginInput 
{
        facebookid:String
        name:String
        email:String
        profilepic:String
        gender:String
        dob:String
        devicetoken:String
        devicetype:String
        version:String
        appversion:String
}
input linkFacebookInput
{
    _id:String
    facebookid:String
    name:String 
    email:String 
    profilepic:String 
    gender:String 
    dob:String
}
input linkTwitterInput
{
    _id:String
    twitterid:String 
    username:String 
    profilepic:String 
    gender:String 
    dob:String
}
input linkEmailInput
{
    _id:String
    username:String
    password:String
}
input unlinkEmailInput
{
    _id:String
}
input unlinkTwitterInput
{
    _id:String
}
input unlinkFacebookInput
{
    _id:String
}
input updateUserInput
{
        _id:String
        type:String
        name:String
        username:String
        profilepic:String
        gender:String
        age:String
        biodata:String
        location:String
        website:String
        userid:String
        value:String
        searchstring:String
        searchType:String
        notification:String
}
input updateStaffUserInput
{
    _id:String
    name:String
    username:String
    role:String
    email:String
}
input changePasswordInput
{
    _id:String
    password:String!
}
input removeUserInput
{
    _id:String
}
input removeStaffUserInput
{
    _id:String
}
input updateUserAdminInput
{
    _id:String
    popular:String
    status:String
}
input userFollowPopularInput
{
    _id:String
}
input userLogoutInput
{
    _id:String
}
input updateWebCreateVisitedInput
{
    _id:String
}
input updateQuickbloxidInput
{
    _id:String
    quickbloxid:String
}
input deleteUserInput
 {
    userids:[String]
}
input suspendUserInput
{
    userids:[String]
}
input makeUserActiveInput
{
    userid:[String]
}
input addNotificationInput
{
        users:String
        notificationText:String
        notificationUserType:String
        notificationType:String
        scheduledTime:String
        isDraft:String
        status:String
}
input editAdminNofiticationInput
{
        _id:String
        users:String
        notificationText:String
        notificationUserType:String
        notificationType:String
        scheduledTime:String
        isDraft:String
}
input deleteAdminNotificationInput
{
    _id:String
}
input addCategoryInput
{
    _id:String
    categoryname:String
}
input editCategoryInput
{
    _id:String
    categoryname:String
}
input deleteCategoryInput
{
    _id:String
}
input addClipperInput 
{
    videoUrl:String
    imageUrl:String
}
input addCommentInput
{
    _id:String
    tweakid:String
    commenttype:String
    commentUrl:String
    comment:String
    userid:String   
}
input deleteCommentInput
{
    _id:String
    userid:String
}
input addFeedBackInput
{
    userid:String
    subject:String
    message:String
}
input addKeyInput 
{
    key:String
}
input notificationInput
{
    _id:String
}
input deleteNotificationInput
{
    _id:String
    notificationid:String
}
input addTemplateMessageInput
{
    title:String
    templateText:String
}
input updateTemplateMessagesInput
{
    _id:String
    title:String
    templateText:String
}
input deleteTemplateMessagesInput
{
    _id:String  
}
input addVideoInput
{
    _id:String
    title:String
    videour:String
    imageurl:String
}
type ActivityType
{
    tweakid: String
    userid:Int
    shareto: String
    status:Int
    created:String
}

type AdminNotificationType
{
    users:[NotificationUsersType]
    notificationText:String
    notificationUserType:String
    notificationType:String
    scheduledTime:String
    isDraft:Int
    status:String
    created:String
}

type NotificationUsersType
{
    user:[UserType]
    status:String
    errorMessage:String
    sentTime:String
}

type CategoryType
{
    categoryname:String
    count:Int
    categoryLikes:Int
    categoryDislikes:Int
    created:String
}

type ClipperType
{
    videoUrl:String
    imageUrl:String
    created:String
}

type CommentType
{
    tweakid:String
    commenttype:String
    commentUrl:String
    comment:String
    userid:String
    created:String
    username:String
    profilepic:String
    commentCount:String
    message:String
}

type CustomMessageType
{
    query:String
    name:String
}

type FeedBackType
{
    userid:String
    username:String
    email:String
    subject:String
    message:String
    created:String
}

type KeyType
{
    key:String
    count:Int
    updated:String
}

type NotificationType
{
    userid:String
    alert:Int
    fromuserid:String
    tweakid:String
    commentid:String
    isread:Int
    type:Int
    created:String
    message:String
}

type TemplateMessagesType
{
    title:String
    templateText:String
    created:String
}

type TweakType
{
    _id:ID!
    userid:String
    title:String
    description:String
    category:[CategoryType]
    image:String
    videourl:String
    starttime:String
    endtime:String
    tweakurl:String
    tweakimage:String
    status:Int
    publicScope:Int
    savePermission:Int
    nsfw:Int
    staffpick:Int
    help:Int
    usertag:[UsertagType]
    tags:[TagType]
    likes:[String]
    bombed:[String]
    flagged:[FlaggedType]
    views:String
    viewsCount:Int
    sharecount:Int
    viewers:[String]
    commentCount:String
    commentsCount:Int
    isbadtweak:Int
    created:String
    lastupdated:String
    categoryType:String
    start:Int
    value:Int
    message: String,
    username :String
    profilepic :String
    isliked :String
    isbombed:String
    likecount:String
    bombedcount:String
    iscommented:Int
    isfollowing:Int
    followerCount:String
    tweakCount:String
    isviewed:Int
    bannerText:String
    bannerColor:String
    bannerXposition:String
    bannerYposition:String
    shareurl:String
    bloopurl:String
    bloopimage:String
    count: Int,
    likesCount:Int
    bombedCount:Int
    reportPath: String
    shareDetails:[ShareDetailsType]
    totalTweaks:Int
    totalViewsCount:Int
    totalLikesCount:Int
    totalDisLikesCount:Int
    totalSharesCount:Int
}

type ShareDetailsType
{
    user:String
    shareType:String
    created:String
}

type UsertagType
{
    user:String
    username:String
    created:String
}

type TagType
{
    tagName:String
    created:String
}

type FlaggedType
{
    user:String
    tweak:String
    flaggedType:String
    created:String
}

type UserType
{
        name:String
        username:String
        email:String
        password:String
        profilepic:String
        gender:String
        age:String
        biodata:String
        location:String
        website:String
        role:String
        popular:Int
        status:Int
        notification:String
        appTheme:Int
        nsfw:Int
        logintype:String
        linkemailuserid:String
        sociallogin:SocialloginType
        devices:[DevicesType]
        likes: [LikesType]
        appversion:String
        followers:[String]
        following:[String]
        searchhistory:[SearchhistoryType]
        isbloopituser:Int
        lastlogin:String
        created:String
        lastupdated:String
        message:String
        isfollowing:Int
        tweakcount:String
        followerscount:String
        viewsCount: Int
        bombedCount:Int
        flaggedcount:Int
        count:Int
        tweakCount:Int
        likesCount:Int
        followersCount:Int
        followingCount:Int
        reportPath:String
        quickbloxid:String
        webCreateVisited:Boolean
        activeUsersCount:Int
        inActiveUsersCount:Int
        totalUsers:Int
        isStaffDelete:Boolean
        isFirstLogin:Boolean
}

type SocialloginType
{
    facebook:FacebookType
    twitter:TwitterType
    google:GoogleType
}

type FacebookType
{
    facebookid:String
    name:String
    email:String
    profilepic:String
    gender:String
    dob:String
}

type TwitterType
{
    twitterid:String
    name:String
    profilepic:String
    gender:String
    dob:String
}

type GoogleType
{
    email:String
    profilePic:String
    gender:String
    dob:String
}

type DevicesType
{
    devicetoken:String
    devicetype:String
    lastLoginDevice:String
    version:String
}

type LikesType
{
    tweakid:String
    created:String
}

type Followers
{
    userid:String
    username:String
    profilepic:String
}

type Following
{
    userid:String
    username:String
    profilepic:String
}

type SearchhistoryType
{
    searchstring:String
    searchType:String
    created:String
}

type WebType
{
    title:String
    videourl:String
    imageurl:String
    created:String
}

type Query
{
    allTweaks:[TweakType]
    getAllTweaksByCategory(getAllTweaksByCategoryInput:getAllTweaksByCategoryInput):[TweakType]
    getTweaks(getTweaksInput:getTweaksInput) : [TweakType]
    getTweaksforWebsite(getTweaksforWebsiteInput:getTweaksforWebsiteInput):[TweakType]
    searchUserAdminNotification(searchUserAdminNotificationInput:searchUserAdminNotificationInput):[UserType]
    getSelectedUsersAdmin(getSelectedUsersAdminInput:getSelectedUsersAdminInput):[UserType]
    allUsers:[UserType]
    allActivities:[ActivityType]
    allAdminNotifications:[AdminNotificationType]
    allCategories:[CategoryType]
    allComments:[CommentType]
    allFeedBacks:[FeedBackType]
    allNotifications:[NotificationType]
}
type Mutation
{
 addTweak(addTweakInput:addTweakInput):[TweakType]
 updateTweak(updateTweakInput:updateTweakInput):[TweakType]
 removeTweak(removeTweakInput:removeTweakInput):[TweakType]
 removeTweakAdmin(removeTweakAdminInput:removeTweakAdminInput):[TweakType]
 updateTweakAdmin(updateTweakAdminInput:updateTweakAdminInput):[TweakType]
 flagTweak(flagTweakInput:flagTweakInput):[TweakType]
 share(shareInput:shareInput):[TweakType]
 shareDetails(shareDetailsInput:shareDetailsInput):[TweakType]
 suspendTweak(suspendTweakInput:suspendTweakInput):[TweakType]
 makeActiveTweak(makeActiveTweakInput:makeActiveTweakInput):[TweakType]
 moveCategory(moveCategoryInput:moveCategoryInput):[CategoryType]
 updateShareUrls:[TweakType]
 signUp(signUpInput:signUpInput):[UserType]
 StafffUsersignUp(StafffUsersignUpInput:StafffUsersignUpInput):[UserType]
 twitterLogin(twitterLoginInput:twitterLoginInput):[UserType]
 facebookLogin(facebookLoginInput:facebookLoginInput):[UserType]
 linkFacebook(linkFacebookInput:linkFacebookInput):[UserType]
 linkTwitter(linkTwitterInput:linkTwitterInput):[UserType]
 linkEmail(linkEmailInput:linkEmailInput):[UserType]
 unlinkEmail(unlinkEmailInput:unlinkEmailInput):[UserType]
 unlinkFacebook(unlinkFacebookInput:unlinkFacebookInput):[UserType]
 unlinkTwitter(unlinkTwitterInput:unlinkTwitterInput):[UserType]
 updateUser(updateUserInput:updateUserInput):[UserType]
 updateStaffUser(updateStaffUserInput:updateStaffUserInput):[UserType]
 changePassword(changePasswordInput:changePasswordInput):[UserType]
 removeUser(removeUserInput:removeUserInput):[UserType]
 removeStaffUser(removeStaffUserInput:removeStaffUserInput):[UserType]
 updateUserAdmin(updateUserAdminInput:updateUserAdminInput):[UserType]
 userFollowPopular(userFollowPopularInput:userFollowPopularInput):[UserType]
 userLogout(userLogoutInput:userLogoutInput):[UserType]
 updateWebCreateVisited(updateWebCreateVisitedInput:updateWebCreateVisitedInput):[UserType]
 updateQuickbloxid(updateQuickbloxidInput:updateQuickbloxidInput):[UserType]
 deleteUser(deleteUserInput:deleteUserInput):[UserType]
 suspendUser(suspendUserInput:suspendUserInput):[UserType]
 makeUserActive(makeUserActiveInput:makeUserActiveInput):[UserType]
 addNotification(addNotificationInput:addNotificationInput):[AdminNotificationType]
 editAdminNotification(editAdminNofiticationInput:editAdminNofiticationInput):[AdminNotificationType]
 deleteAdminNotification(deleteAdminNotificationInput:deleteAdminNotificationInput):[AdminNotificationType]
 addCategory(addCategoryInput:addCategoryInput):[CategoryType]
 editCategory(editCategoryInput:editCategoryInput):[CategoryType]
 deleteCategory(deleteCategoryInput:deleteCategoryInput):[CategoryType]
 addClipper(addClipperInput:addClipperInput):[ClipperType]
 addComment(addCommentInput:addCommentInput):[CommentType]
 deleteComment(deleteCommentInput:deleteCommentInput):[CommentType]
 addFeedBack(addFeedBackInput:addFeedBackInput):[FeedBackType]
 addKey(addKeyInput:addKeyInput):[KeyType]
 notifications(notificationInput:notificationInput):[NotificationType]
 deleteNotification(deleteNotificationInput:deleteNotificationInput):[NotificationType]
 addTemplateMessage(addTemplateMessageInput:addTemplateMessageInput):[TemplateMessagesType]
 updateTemplateMessages(updateTemplateMessagesInput:updateTemplateMessagesInput):[TemplateMessagesType]
 deleteTemplateMessages(deleteTemplateMessagesInput:deleteTemplateMessagesInput):[TemplateMessagesType]
 addVideo(addVideoInput:addVideoInput):[WebType]
}
`;

module.exports = typeDefs;
