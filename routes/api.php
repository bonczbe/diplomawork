<?php

use App\Http\Controllers\AlertsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SupervisorController;
use App\Http\Controllers\PostsController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\ReplyController;
use App\Http\Controllers\EventHelperController;
use App\Http\Controllers\EventsController;
use App\Http\Controllers\GroupChatController;
use App\Http\Controllers\GroupChatHelperController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupMemberController;
use App\Http\Controllers\GroupMessageController;
use App\Http\Controllers\GroupPostCommentController;
use App\Http\Controllers\GroupPostController;
use App\Http\Controllers\GroupPostImagesController;
use App\Http\Controllers\GroupPostReactionController;
use App\Http\Controllers\GroupPostReplyController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\MessagesController;
use App\Http\Controllers\MessagesDataController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PagePostCommentController;
use App\Http\Controllers\PagesHelperController;
use App\Http\Controllers\PagesPostController;
use App\Http\Controllers\PagesPostImagesController;
use App\Http\Controllers\PagesPostReactionController;
use App\Http\Controllers\PagesPostReplyController;
use App\Http\Controllers\PersonalEmoteController;
use App\Http\Controllers\PostImageController;
use App\Http\Controllers\PostsActionController;
use App\Http\Controllers\ProfilePicController;
use App\Http\Controllers\RelationsController;
use App\Http\Controllers\SavedHistoryGroupController;
use App\Http\Controllers\SavedHistoryGroupHelperController;
use App\Http\Controllers\WallPaperController;
use App\Http\Controllers\AllPostController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SerachBarController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('/auth')->group(function () {
    Route::prefix('/supervisor')->group(
        function () {
            Route::post('/login', [SupervisorController::class, 'login']);
            Route::post('/newVerify', [SupervisorController::class, 'setNewVerify']);
            Route::put('/verify', [SupervisorController::class, 'getVerification']);
            Route::post('/newPasswordHash', [SupervisorController::class, 'forgotten']);
            Route::post('/newPassword', [SupervisorController::class, 'forgottenSetNewPasswd']);
        }
    );
    Route::prefix('/user')->group(
        function () {
            Route::get('/{input}', [UserController::class, 'show']);
            Route::post('/login', [UserController::class, 'login']);
            Route::post('/newVerify', [UserController::class, 'setNewVerify']);
            Route::put('/verify', [UserController::class, 'getVerification']);
            Route::post('/newPasswordHash', [UserController::class, 'forgotten']);
            Route::post('/newPassword', [UserController::class, 'forgottenSetNewPasswd']);
            Route::post('/register', [UserController::class, 'store']);
        }
    );
});
Route::prefix('/usersNeeded')->group(function () {
    Route::get('/{input}', [UserController::class, 'show']);
    Route::get('/wallpaper/{id}/{userID}', [WallPaperController::class, 'show']);
    Route::get('/posts/all/{id}', [PostsController::class, 'indexByUser']);
    Route::get('/postImages/all/{id}', [PostImageController::class, 'indexByID']);
    Route::get('/pageImages/allByPage/{id}', [PagesPostImagesController::class, 'indexByPage']);
    Route::get('/postimage/allByUser/{id}', [PostImageController::class, 'indexByUser']);
    Route::get('/wallpaper/all/{place}/{id}', [WallPaperController::class, 'indexByOutsideID']);
    Route::get('/profilepics/all/{place}/{id}', [ProfilePicController::class, 'indexByOutsideID']);
    Route::get('/page/id/{id}', [PageController::class, 'show']);
    Route::get('/group/{id}', [GroupController::class, 'show']);
    Route::get('/event/{id}', [EventsController::class, 'show']);
    Route::get('/pagePost/all/{id}', [PagesPostController::class, 'indexById']);
    Route::get('/groupPosts/all/{id}/{userID}', [GroupPostController::class, 'indexById']);
    Route::get('/searching/{text}', [SerachBarController::class, 'index']);
});
Route::middleware(['auth:supervisor', 'type.admin'])->prefix('/supervisors')->group(function () {
    Route::get('/numberOfUsers', [UserController::class, 'numberOfUsers']);
    Route::post('/logout', [SupervisorController::class, 'logout']);
    Route::post('/register', [SupervisorController::class, 'store']);
    Route::get('/datas', [SupervisorController::class, 'show']);
    Route::get('/admins', [SupervisorController::class, 'index']);
    Route::get('/admins/infos', [SupervisorController::class, 'indexWithInfos']);  ///ez
    Route::get('/admins/{id}', [SupervisorController::class, 'destroy']);
    Route::post('/editSettings/{id}', [SupervisorController::class, 'update']);
    Route::post('/editPasswd/{id}', [SupervisorController::class, 'newPasswd']);
    Route::prefix('/reports')->group(function () {
        Route::prefix('/list')->group(
            function () {
                Route::get('/numberOfChecked', [ReportController::class, 'CheckedNumber']);
                Route::get('/numberOfUnChecked', [ReportController::class, 'UnCheckedNumber']);
            }
        );
        Route::get('/allReports', [ReportController::class, 'index']);
        Route::post('/notContent', [ReportController::class, 'destroyFromSpecific']);
        Route::post('/content', [ReportController::class, 'checked']);
        Route::post('/checked/{userID}', [ReportController::class, 'index']);
        Route::prefix('/posts')->group(
            function () {
                Route::get('/normalPost/{id}', [PostsController::class, 'show']);
                Route::get('/groupPost/{id}', [PagePostCommentController::class, 'show']);
                Route::get('/pagePost/{id}', [GroupPostController::class, 'show']);
            }
        );
        Route::prefix('/comments')->group(
            function () {
                Route::get('/normalComment/{id}', [CommentsController::class, 'show']);
                Route::get('/pageComment/{id}', [PagesPostController::class, 'show']);
                Route::get('/groupComment/{id}', [GroupPostCommentController::class, 'show']);
            }
        );
        Route::prefix('/replies')->group(
            function () {
                Route::get('/normalReply/{id}', [PostsController::class, 'show']);
                Route::get('/pageReply/{id}', [PagesPostController::class, 'show']);
                Route::get('/groupReply/{id}', [GroupPostController::class, 'show']);
            }
        );
        Route::prefix('/images')->group(
            function () {
                Route::get('/profilePic/{id}/{outsideID}', [ProfilePicController::class, 'show']);
                Route::get('/wallPaper/{id}/{userID}', [WallPaperController::class, 'show']);
                Route::get('/history/{id}', [HistoryController::class, 'show']);
                Route::prefix('/postImages')->group(
                    function () {
                        Route::get('/PostImage/{id}', [PostImageController::class, 'show']);
                        Route::get('/normalPostImage/{id}', [PostImageController::class, 'show']);
                        Route::get('/pagePostImage/{id}', [PagesPostImagesController::class, 'show']);
                        Route::get('/groupPostImage/{id}', [GroupPostImagesController::class, 'show']);
                    }
                );
            }
        );
    });
});
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/reports')->group(
    function () {
        Route::post('/new', [ReportController::class, 'store']);
        Route::get('/{outsideID}/{userID}/{type}', [ReportController::class, 'show']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/users')->group(
    function () {
        Route::get('/{id}', [UserController::class, 'showWithSanctum']);
        Route::get('/idFromTag/{tag}', [UserController::class, 'idFromTag']);
        Route::post('/ByName', [UserController::class, 'indexByName']);
        Route::get('/ById/{id}', [UserController::class, 'getName']);
        Route::get('/all', [UserController::class, 'index']);
        Route::put('/update/{id}', [UserController::class, 'update']);
        Route::put('/editWallpaperID/{id}', [UserController::class, 'editWallpaperID']);
        Route::put('/editProfileID/{id}', [UserController::class, 'editProfileID']);
        Route::put('/editRole/{id}', [UserController::class, 'editRole']);
        Route::put('/newPasswd/{id}', [UserController::class, 'newPasswd']);
        Route::delete('/delete/{id}/{tag}', [UserController::class, 'destroy']);
        Route::post('/logout', [UserController::class, 'logout']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/post')->group(
    function () {
        Route::get('/{id}', [PostsController::class, 'show']);
        Route::post('/new', [PostsController::class, 'store']);
        Route::get('/all', [PostsController::class, 'index']);
        Route::get('/all/{id}', [PostsController::class, 'indexByUser']);
        Route::put('/update/{id}', [PostsController::class, 'update']);
        Route::delete('/delete/{id}', [PostsController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/comments')->group(
    function () {
        Route::get('/{id}', [CommentsController::class, 'show']);
        Route::post('/new', [CommentsController::class, 'store']);
        Route::get('/all/post/{id}', [CommentsController::class, 'index']);
        Route::get('/all/user/{id}', [CommentsController::class, 'indexByUser']);
        Route::put('/update/{id}', [CommentsController::class, 'update']);
        Route::delete('/delete/{id}', [CommentsController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/replies')->group(
    function () {
        Route::get('/{id}', [ReplyController::class, 'show']);
        Route::post('/new', [ReplyController::class, 'store']);
        Route::get('/all/comments/{id}', [ReplyController::class, 'index']);
        Route::get('/all/user/{id}', [ReplyController::class, 'indexByUser']);
        Route::put('/update/{id}', [ReplyController::class, 'update']);
        Route::delete('/delete/{id}', [ReplyController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/eventshelper')->group(
    function () {
        Route::get('/{id}', [EventHelperController::class, 'show']);
        Route::get('/isOwner/{eventID}/{userID}', [EventHelperController::class, 'isOwner']);
        Route::get('/liked/{eventID}/{userID}', [EventHelperController::class, 'isMember']);
        Route::get('/all/{id}', [EventHelperController::class, 'index']);
        Route::get('/all/user/{id}', [EventHelperController::class, 'indexByUser']);
        Route::get('/all/event/{id}', [EventHelperController::class, 'indexByEvent']);
        Route::get('/members/{id}', [EventHelperController::class, 'Members']);
        Route::post('/new', [EventHelperController::class, 'store']);
        Route::put('/update/{id}', [EventHelperController::class, 'update']);
        Route::get('/relation/{eventID}/{userID}', [EventHelperController::class, 'relation']);
        Route::get('/admins/{id}', [EventHelperController::class, 'admins']);
        Route::get('/blocked/{id}', [EventHelperController::class, 'blockedUsers']);
        Route::delete('/delete/{id}', [EventHelperController::class, 'destroy']);
    }
);

Route::middleware(['auth:sanctum', 'type.user'])->prefix('/event')->group(
    function () {
        Route::get('/all', [EventsController::class, 'index']);
        Route::get('/all', [EventsController::class, 'indexByName']);
        Route::post('/new', [EventsController::class, 'store']);
        Route::put('/update/{id}/{userID}', [EventsController::class, 'update']);
        Route::put('/editWallpaperID/{id}', [EventsController::class, 'editWallpaperID']);
        Route::put('/actualProfilePicID/{id}', [EventsController::class, 'actualProfilePicID']);
        Route::get('/show/{id}', [EventsController::class, 'show']);
        Route::delete('/delete/{id}/{owner}', [EventsController::class, 'destroy']);
    }
);

Route::middleware(['auth:sanctum', 'type.user'])->prefix('/groupchat')->group(
    function () {
        Route::get('/{id}', [GroupChatController::class, 'show']);
        Route::get('/ById/{id}', [GroupChatController::class, 'getName']);
        Route::get('/all', [GroupChatController::class, 'index']);
        Route::post('/new', [GroupChatController::class, 'store']);
        Route::put('/update/{id}', [GroupChatController::class, 'update']);
        Route::put('/editProfileID/{id}', [GroupChatController::class, 'editProfileID']);
        Route::delete('/delete/{id}', [GroupChatController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/groupchathelper')->group(
    function () {
        Route::get('/all', [GroupChatHelperController::class, 'index']);
        Route::get('/all/user/{id}', [GroupChatHelperController::class, 'indexByUser']);
        Route::get('/all/userByGroup/{id}', [GroupChatHelperController::class, 'indexMembers']);
        Route::get('/all/groupChat/{groupChatID}', [GroupChatHelperController::class, 'indexByChatID']);
        Route::get('/all/{userID}/{groupChatID}', [GroupChatHelperController::class, 'indexByUserMessage']);
        Route::post('/new', [GroupChatHelperController::class, 'store']);
        Route::get('/{id}', [GroupChatHelperController::class, 'show']);
        Route::put('/update/{id}', [GroupChatHelperController::class, 'update']);
        Route::delete('/delete/{id}', [GroupChatHelperController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/groupchatmessage')->group(
    function () {
        Route::get('/all', [GroupMessageController::class, 'index']);
        Route::get('/all/{id}', [GroupMessageController::class, 'indexByGroupChatId']);
        Route::get('/all/images/{id}', [GroupMessageController::class, 'indexByGroupChatIDImages']);
        Route::post('/new', [GroupMessageController::class, 'store']);
        Route::get('/{id}', [GroupMessageController::class, 'show']);
        Route::delete('/delete/{id}', [GroupMessageController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/group')->group(
    function () {
        Route::get('/all', [GroupController::class, 'index']);
        Route::get('/all/{name}', [GroupController::class, 'indexByName']);
        Route::post('/new', [GroupController::class, 'store']);
        Route::get('/show/{id}', [GroupController::class, 'show']);
        Route::get('/fromPost/{id}/{userID}', [GroupController::class, 'getFromPost']);
        Route::put('/update/{id}/{userID}', [GroupController::class, 'update']);
        Route::delete('/delete/{id}/{owner}', [GroupController::class, 'destroy']);
        Route::put('/editProfileID/{id}', [GroupController::class, 'editProfileID']);
        Route::put('/editWallpaperID/{id}', [GroupController::class, 'editWallpaperID']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/groupmember')->group(
    function () {
        Route::get('/all', [GroupMemberController::class, 'index']);
        Route::get('/all/{id}', [GroupMemberController::class, 'indexByIDUser']);
        Route::get('/members/{id}', [GroupMemberController::class, 'Members']);
        Route::get('/requests/{id}', [GroupMemberController::class, 'Requests']);
        Route::get('/canPost/{groupID}/{id}', [GroupMemberController::class, 'canPost']);
        Route::get('/canSee/{groupID}/{id}', [GroupMemberController::class, 'canSee']);
        Route::post('/new', [GroupMemberController::class, 'store']);
        Route::get('/{id}', [GroupMemberController::class, 'show']);
        Route::get('/isOwner/{groupID}/{memberID}', [GroupMemberController::class, 'isOwner']);
        Route::get('/liked/{groupID}/{memberID}', [GroupMemberController::class, 'isMember']);
        Route::get('/relation/{groupID}/{userID}', [GroupMemberController::class, 'relation']);
        Route::put('/update/{id}', [GroupMemberController::class, 'update']);
        Route::get('/admins/{id}', [GroupMemberController::class, 'admins']);
        Route::get('/blocked/{id}', [GroupMemberController::class, 'blockedUsers']);
        Route::delete('/delete/{id}', [GroupMemberController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/grouppostcomment')->group(
    function () {
        Route::get('/all/{id}', [GroupPostCommentController::class, 'index']);
        Route::get('/all/user/{id}', [GroupPostCommentController::class, 'indexByUser']);
        Route::post('/new', [GroupPostCommentController::class, 'store']);
        Route::get('/{id}', [GroupPostCommentController::class, 'show']);
        Route::put('/update/{id}', [GroupPostCommentController::class, 'update']);
        Route::delete('/delete/{id}', [GroupPostCommentController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/grouppost')->group(
    function () {
        Route::get('/all/{id}', [GroupPostController::class, 'index']);
        Route::get('/all/user/{id}/{userID}', [GroupPostController::class, 'indexByUser']);
        Route::get('/all/group/{id}', [GroupPostController::class, 'indexById']);
        Route::post('/new', [GroupPostController::class, 'store']);
        Route::get('/{id}', [GroupPostController::class, 'show']);
        Route::put('/update/{id}', [GroupPostController::class, 'update']);
        Route::delete('/delete/{id}', [GroupPostController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/grouppostimage')->group(
    function () {
        Route::get('/all/{id}', [GroupPostImagesController::class, 'index']);
        Route::get('/allByGroup/{id}', [GroupPostImagesController::class, 'indexByGroup']);
        Route::post('/new', [GroupPostImagesController::class, 'store']);
        Route::get('/{id}', [GroupPostImagesController::class, 'show']);
        Route::delete('/delete/{id}', [GroupPostImagesController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/grouppostreaction')->group(
    function () {
        Route::get('/all', [GroupPostReactionController::class, 'index']);
        Route::get('/all/groupBy/{id}/{typeofdata}', [GroupPostReactionController::class, 'indexByActions']);
        Route::get('/all/type/{id}/{type}/{typeofdata}', [GroupPostReactionController::class, 'indexByType']);
        Route::get('/userAction/{userID}/{outsideID}/{typeofdata}', [GroupPostReactionController::class, 'userAction']);
        Route::post('/new', [GroupPostReactionController::class, 'store']);
        Route::get('/{id}', [GroupPostReactionController::class, 'show']);
        Route::put('/update/{id}', [GroupPostReactionController::class, 'update']);
        Route::delete('/delete/{id}', [GroupPostReactionController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/grouppostreply')->group(
    function () {
        Route::get('/all/{id}', [GroupPostReplyController::class, 'index']);
        Route::post('/new', [GroupPostReplyController::class, 'store']);
        Route::get('/{id}', [GroupPostReplyController::class, 'show']);
        Route::put('/update/{id}', [GroupPostReplyController::class, 'update']);
        Route::delete('/delete/{id}', [GroupPostReplyController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/history')->group(
    function () {
        Route::get('/all', [HistoryController::class, 'index']);
        Route::get('/all/user/{id}', [HistoryController::class, 'index24ByUser']);
        Route::get('/all/friends/{id}', [HistoryController::class, 'index24ByUserFriends']);
        Route::post('/new', [HistoryController::class, 'store']);
        Route::get('/{id}', [HistoryController::class, 'show']);
        Route::get('/group/{id}', [HistoryController::class, 'showAGroup']);
        Route::delete('/delete/{id}', [HistoryController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/savedhistorygroup')->group(
    function () {
        Route::get('/all/{id}', [SavedHistoryGroupController::class, 'index']);
        Route::get('/all/thumb/{id}', [SavedHistoryGroupController::class, 'indexJustProfileAndName']);
        Route::get('/all/group/{id}', [SavedHistoryGroupController::class, 'indexByGroup']);
        Route::post('/new', [SavedHistoryGroupController::class, 'store']);
        Route::put('/editProfileID/{id}', [SavedHistoryGroupController::class, 'editProfileID']);
        Route::get('/{id}', [SavedHistoryGroupController::class, 'show']);
        Route::put('/update/{id}', [SavedHistoryGroupController::class, 'update']);
        Route::delete('/delete/{id}', [SavedHistoryGroupController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/savedhistorygrouphelper')->group(
    function () {
        Route::get('/all', [SavedHistoryGroupHelperController::class, 'index']);
        Route::post('/new', [SavedHistoryGroupHelperController::class, 'store']);
        Route::get('/{id}', [SavedHistoryGroupHelperController::class, 'show']);
        Route::delete('/delete/{id}/{groupID}', [SavedHistoryGroupHelperController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/allPosts')->group(
    function () {
        Route::get('/all/{userID}', [AllPostController::class, 'index']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/message')->group(
    function () {
        Route::get('/all', [MessagesController::class, 'index']);
        Route::get('/all/{user1ID}/{user2ID}', [MessagesController::class, 'indexByUser']);
        Route::get('/all/right/{userID1}/{userID2}/{type}', [MessagesController::class, 'fromRight']);
        Route::get('/all/{userID}', [MessagesController::class, 'allMessages']);
        Route::post('/new', [MessagesController::class, 'store']);
        Route::get('/{id}', [MessagesController::class, 'show']);
        Route::put('/update/{id}', [MessagesController::class, 'update']);
        Route::delete('/delete/{id}', [MessagesController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/messagedata')->group(
    function () {
        Route::get('/all', [MessagesDataController::class, 'index']);
        Route::get('/all/{id}', [MessagesDataController::class, 'indexChatID']);
        Route::get('/all/images/{id}', [MessagesDataController::class, 'indexChatIDImages']);
        Route::post('/new', [MessagesDataController::class, 'store']);
        Route::post('/setseen/{id}/{whouserID}', [MessagesDataController::class, 'setSeen']);
        Route::get('/{id}', [MessagesDataController::class, 'show']);
        Route::put('/update/{id}', [MessagesDataController::class, 'update']);
        Route::delete('/delete/{id}', [MessagesDataController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/page')->group(
    function () {
        Route::get('/all', [PageController::class, 'index']);
        Route::get('/all/{name}', [PageController::class, 'indexByName']);
        Route::post('/new', [PageController::class, 'store']);
        Route::put('/editProfileID/{id}', [PageController::class, 'editProfileID']);
        Route::put('/editWallpaperID/{id}', [PageController::class, 'editWallpaperID']);
        Route::put('/update/{id}/{userID}', [PageController::class, 'update']);
        Route::get('/show/{id}', [PageController::class, 'show']);
        Route::delete('/delete/{id}/{owner}', [PageController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/pagepostcomment')->group(
    function () {
        Route::get('/{id}', [PagePostCommentController::class, 'index']);
        Route::post('/new', [PagePostCommentController::class, 'store']);
        Route::get('/all/post/{id}', [CommentsController::class, 'index']);
        Route::put('/update/{id}', [PagePostCommentController::class, 'update']);
        Route::delete('/delete/{id}', [PagePostCommentController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/pagehelper')->group(
    function () {
        Route::get('/all', [PagesHelperController::class, 'index']);
        Route::get('/all/{id}', [PagesHelperController::class, 'indexByUser']);
        Route::get('/followers/{id}', [PagesHelperController::class, 'Followers']);
        Route::post('/new', [PagesHelperController::class, 'store']);
        Route::get('/{id}', [PagesHelperController::class, 'show']);
        Route::get('/isOwner/{pageID}/{userID}', [PagesHelperController::class, 'isOwner']);
        Route::get('/liked/{pageID}/{userID}', [PagesHelperController::class, 'isLiked']);
        Route::get('/relation/{pageID}/{userID}', [PagesHelperController::class, 'relation']);
        Route::put('/update/{id}', [PagesHelperController::class, 'update']);
        Route::get('/admins/{id}', [PagesHelperController::class, 'admins']);
        Route::get('/blocked/{id}', [PagesHelperController::class, 'blockedUsers']);
        Route::delete('/delete/{id}', [PagesHelperController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/pagepost')->group(
    function () {
        Route::get('/all', [PagesPostController::class, 'index']);
        Route::post('/new', [PagesPostController::class, 'store']);
        Route::get('/{id}', [PagesPostController::class, 'show']);
        Route::put('/update/{id}', [PagesPostController::class, 'update']);
        Route::delete('/delete/{id}', [PagesPostController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/pagepostimage')->group(
    function () {
        Route::get('/all/{id}', [PagesPostImagesController::class, 'index']);
        Route::post('/new', [PagesPostImagesController::class, 'store']);
        Route::get('/{id}', [PagesPostImagesController::class, 'show']);
        Route::delete('/delete/{id}', [PagesPostImagesController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/pagepostreaction')->group(
    function () {
        Route::get('/all', [PagesPostReactionController::class, 'index']);
        Route::get('/all/groupBy/{id}/{typeofdata}', [PagesPostReactionController::class, 'indexByActions']);
        Route::get('/all/type/{id}/{type}/{typeofdata}', [PagesPostReactionController::class, 'indexByType']);
        Route::get('/userAction/{userID}/{outsideID}/{typeofdata}', [PagesPostReactionController::class, 'userAction']);
        Route::post('/new', [PagesPostReactionController::class, 'store']);
        Route::get('/{id}', [PagesPostReactionController::class, 'show']);
        Route::put('/update/{id}', [PagesPostReactionController::class, 'update']);
        Route::delete('/delete/{id}', [PagesPostReactionController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/pagepostreply')->group(
    function () {
        Route::get('/all', [PagesPostReplyController::class, 'index']);
        Route::get('/all/{id}', [PagesPostReplyController::class, 'indexByID']);
        Route::post('/new', [PagesPostReplyController::class, 'store']);
        Route::get('/{id}', [PagesPostReplyController::class, 'show']);
        Route::put('/update/{id}', [PagesPostReplyController::class, 'update']);
        Route::delete('/delete/{id}', [PagesPostReplyController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/personalemote')->group(
    function () {
        Route::get('/all', [PersonalEmoteController::class, 'index']);
        Route::get('/all/{id}', [PersonalEmoteController::class, 'indexByUser']);
        Route::get('/allInGoups/{id}', [PersonalEmoteController::class, 'indexByGroup']);
        Route::post('/new', [PersonalEmoteController::class, 'store']);
        Route::get('/{namne}/{id}', [PersonalEmoteController::class, 'show']);
        Route::delete('/delete/{id}', [PersonalEmoteController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/postimage')->group(
    function () {
        Route::get('/all', [PostImageController::class, 'index']);
        Route::get('/all/{id}', [PostImageController::class, 'indexByID']);
        Route::post('/new', [PostImageController::class, 'store']);
        Route::get('/{id}', [PostImageController::class, 'show']);
        Route::delete('/delete/{id}', [PostImageController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/postaction')->group(
    function () {
        Route::get('/all', [PostsActionController::class, 'index']);
        Route::get('/all/groupBy/{id}/{typeofdata}', [PostsActionController::class, 'indexByActions']);
        Route::get('/type/{id}/{type}/{typeofdata}', [PostsActionController::class, 'indexByType']);
        Route::get('/userAction/{userID}/{outsideID}/{typeofdata}', [PostsActionController::class, 'userAction']);
        Route::post('/new', [PostsActionController::class, 'store']);
        Route::get('/{id}', [PostsActionController::class, 'show']);
        Route::put('/update/{id}', [PostsActionController::class, 'update']);
        Route::delete('/delete/{id}', [PostsActionController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/profilepics')->group(
    function () {
        Route::get('/all', [ProfilePicController::class, 'index']);
        Route::get('/all/index/{place}/{id}', [ProfilePicController::class, 'indexByOutsideID']);
        Route::post('/new', [ProfilePicController::class, 'store']);
        Route::get('/{id}/{outsideID}', [ProfilePicController::class, 'show']);
        Route::get('/showActual/{place}/{outsideID}', [ProfilePicController::class, 'showActual']);
        Route::delete('/delete/{id}/{place}/{user}', [ProfilePicController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/relations')->group(
    function () {
        Route::get('/all/{id}', [RelationsController::class, 'index']);
        Route::get('/all/fromUser/{id}', [RelationsController::class, 'indexByUser']);
        Route::post('/new', [RelationsController::class, 'store']);
        Route::put('/update/{id}', [RelationsController::class, 'update']);
        Route::get('/isFriend/{id}/{id2}', [RelationsController::class, 'show']);
        Route::get('/blockeds/{userID}', [RelationsController::class, 'blockeds']);
        Route::delete('/delete/{id}/{user1ID}/{user2ID}', [RelationsController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/wallpaper')->group(
    function () {
        Route::get('/all', [WallPaperController::class, 'index']);
        Route::get('/all/index/{place}/{id}', [WallPaperController::class, 'indexByOutsideID']);
        Route::post('/new', [WallPaperController::class, 'store']);
        Route::get('/{id}/{userID}', [WallPaperController::class, 'show']);
        Route::delete('/delete/{id}/{place}/{user}', [WallPaperController::class, 'destroy']);
    }
);
Route::middleware(['auth:sanctum', 'type.user'])->prefix('/alerts')->group(
    function () {
        Route::get('/all/{id}', [AlertsController::class, 'index']);
        Route::post('/new', [AlertsController::class, 'store']);
        Route::post('/seen/{userID}', [AlertsController::class, 'setSeen']);
        Route::delete('/delete/{id}', [AlertsController::class, 'destroy']);
    }
);
