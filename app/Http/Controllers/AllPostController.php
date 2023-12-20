<?php

namespace App\Http\Controllers;

use App\Models\PostImage;
use App\Models\Posts;
use App\Models\ProfilePic;
use App\Models\User;
use App\Models\PagesPost;
use App\Models\Page;
use App\Models\PagesPostImages;
use App\Models\GroupPosts;
use App\Models\Group;
use App\Models\GroupPostImages;
use App\Models\Relations;
use App\Models\GroupMember;
use App\Models\PagesHelper;
use Illuminate\Support\Facades\DB;

class AllPostController extends Controller
{
    /**
     * It gets all the posts from the user, his friends, his pages and his groups.
     * </code>
    * aí
     * @param userID The user's ID
     * 
     * @return A collection of posts.
     */
    public function index($userID)
    {
        $normalPost = Posts::where('userID', $userID)->orderBy('date', "DESC")->get();
        $normalPost->map(function ($Post) {
            $Post->owner = User::where('id', $Post->userID)->get(['firstName', 'middleName', 'lastName', 'tag'])->first();
            $Post->tag = $Post->owner->tag;
            $middleName = "";
            if ($Post->owner->middleName) $middleName = $Post->owner->middleName . ' ';
            $Post->owner = '' . $Post->owner->firstName . ' ' . $middleName . $Post->owner->lastName;
            if ($Post->isFile) {
                $Post->files = PostImage::where('postID', $Post->id)->get(['id', 'imageURI']);
            }
            $Post->ownerImage = User::where('id', $Post->userID)->get(['actualProfilePicID'])->first();
            $Post->ownerImage = ProfilePic::where('id', $Post->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
            $Post->place = "normalPost";
        });

        $friendsPosts = collect();
        $relations = Relations::where(function ($query) use ($userID) {
            $query->where("user1ID", $userID)->orWhere("user2ID", $userID);
        })->where("type", "<", 4)->where("type", ">", 0)->get();

        $friendsPosts = $relations->map(function ($friend) use ($userID, $friendsPosts) {
            $otherUser = (($friend->user1ID == $userID) ? $friend->user2ID : $friend->user1ID);
            $friendPosts = Posts::where('userID', $otherUser)->orderBy('date', "DESC")->get();

            $friendPosts->map(function ($Post) {
                $Post->owner = User::where('id', $Post->userID)->get(['firstName', 'middleName', 'lastName'])->first();
                $middleName = "";
                if ($Post->owner->middleName) $middleName = $Post->owner->middleName . ' ';
                $Post->owner = '' . $Post->owner->firstName . ' ' . $middleName . $Post->owner->lastName;
                if ($Post->isFile) {
                    $Post->files = PostImage::where('postID', $Post->id)->get(['id', 'imageURI']);
                }
                $Post->ownerImage = User::where('id', $Post->userID)->get(['actualProfilePicID'])->first();
                $Post->ownerImage = ProfilePic::where('id', $Post->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
                $Post->place = "normalPost";
            });
            $friendsPosts = $friendsPosts->merge($friendPosts);
            return $friendsPosts;
        });
        $friendsPosts = $friendsPosts->flatten(2);
        $pagesPosts = collect();
        $pageHelper = PagesHelper::where('userID', $userID)->where('rank', '<', 4)->get();
        $pagesPosts = $pageHelper->map(function ($page) use ($pagesPosts) {
            $pagePosts = PagesPost::where('pageID', $page->pageID)->orderBy('date', 'DESC')->get();
            $pagePosts->map(function ($page) use ($pagesPosts) {
                $page->owner = Page::where('id', $page->pageID)->get(['name'])->first();
                $page->owner = $page->owner->name;
                if ($page->isFile) {
                    $page->files = PagesPostImages::where('postID', $page->id)->get(['id', 'imageURI']);
                }
                $page->ownerImage = Page::where('id', $page->pageID)->get(['actualProfilePicID'])->first();
                $page->ownerImage = ProfilePic::where('id', $page->ownerImage->actualProfilePicID)->get(["profilePicURI"])->first();
                $page->place = "pagePost";
            });
            $pagesPosts = $pagesPosts->merge($pagePosts);
            return $pagesPosts;
        });
        $pagesPosts = $pagesPosts->flatten(2);
        $groupsPosts = collect();
        $groupHelper = GroupMember::where('memberID', $userID)->where('rank', '<', 5)->get();
        $groupsPosts = $groupHelper->map(function ($group) use ($groupsPosts) {
            $groupPosts = GroupPosts::where('groupID', $group->groupID)->orderBy('date', 'DESC')->get();
            $groupPosts->map(function ($group) {
                $group->owner = User::where('id', $group->who)->get(['firstName', 'middleName', 'lastName'])->first();
                $middleName = "";
                if ($group->owner->middleName) $middleName = $group->owner->middleName . ' ';
                $group->owner = '' . $group->owner->firstName . ' ' . $middleName . $group->owner->lastName;
                if ($group->isFile) {
                    $group->files = GroupPostImages::where('postID', $group->id)->get(['id', 'imageURI']);
                }
                $group->ownerImage = Group::where('id', $group->groupID)->get(['actualProfileID'])->first();
                $group->ownerImage = ProfilePic::where('id', $group->ownerImage->actualProfileID)->get(["profilePicURI"])->first();
                $group->place = "groupPost";
            });
            $groupsPosts = $groupsPosts->merge($groupPosts);
            return $groupsPosts;
        });
        $groupsPosts = $groupsPosts->flatten(2);
        $posts = $normalPost->merge($friendsPosts)->merge($pagesPosts)->merge($groupsPosts)->sortByDesc('date');
        return $posts;
    }
}
