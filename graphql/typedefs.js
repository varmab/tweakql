let typeDefs = `

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
    getAllTweaksByCategory:[TweakType]
    getTweaks:[TweakType]
    getTweaksforWebsite:[TweakType]
    searchUserAdminNotification:[UserType]
    getSelectedUsersAdmin:[UserType]
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
 addTweak:TweakType
 updateTweak:TweakType
 removeTweak:TweakType
 removeTweakAdmin:TweakType
 updateTweakAdmin:TweakType
 flagTweak:TweakType
 share:TweakType
 shareDetails:TweakType
 suspendTweak:TweakType
 makeActiveTweak:TweakType
 moveCategory:CategoryType
 updateShareUrls:TweakType
 signUp:UserType
 StafffUsersignUp:UserType
 twitterLogin:UserType
 facebookLogin:UserType
 linkFacebook:UserType
 linkTwitter:UserType
 linkEmail:UserType
 unlinkEmail:UserType
 unlinkFacebook:UserType
 unlinkTwitter:UserType
 updateUser:UserType
 updateStaffUser:UserType
 changePassword:UserType
 removeUser:UserType
 removeStaffUser:UserType
 updateUserAdmin:UserType
 userFollowPopular:UserType
 userLogout:UserType
 updateWebCreateVisited:UserType
 updateQuickbloxid:UserType
 deleteUser:UserType
 suspendUser:UserType
 makeUserActive:UserType
 addNotification:AdminNotificationType
 editAdminNotification:AdminNotificationType
 deleteAdminNotification:AdminNotificationType
 addCategory:CategoryType
 editCategory:CategoryType
 deleteCategory:CategoryType
 addClipper:ClipperType
 addComment:CommentType
 deleteComment:CommentType
 addFeedBack:FeedBackType
 addKey:KeyType
 notifications:NotificationType
 deleteNotification:NotificationType
 addTemplateMessage:TemplateMessagesType
 updateTemplateMessages:TemplateMessagesType
 deleteTemplateMessages:TemplateMessagesType
 addVideo:WebType
}
`;

module.exports = typeDefs;
