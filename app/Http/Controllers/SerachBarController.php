<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Events;
use App\Models\Group;
use App\Models\Page;
use App\Models\ProfilePic;

class SerachBarController extends Controller
{
    /**
     * It searches for users, pages, groups, and events that match the search query
     * 
     * @param text the text that the user is searching for
     * 
     * @return An array of objects.
     */
    public function index($text)
    {
        $users = User::whereRaw("concat(firstName, IF(middleName IS NULL, '', CONCAT(' ', middleName)), ' ', lastName) LIKE ?", ["$text%"])->orWhere('tag', 'LIKE', $text . '%')
            ->get(["id", "actualProfilePicID", "firstName", "middleName", "lastName", "tag"]);

        $users->each(function ($user) {
            $user->type = "user";
            $user->profileIMG = ProfilePic::where('id', $user->actualProfilePicID)->get(["profilePicURI"])->first();
            $middleName = "";
            if ($user->middleName) $middleName = $user->middleName . ' ';
            $user->name = '' . $user->firstName . ' ' . $middleName . $user->lastName;
        });
        $pages = Page::where(
            'name',
            'LIKE',
            $text . '%'
        )->orderBy('name', 'DESC')->get([
            "id", "actualProfilePicID", 'name'
        ])
            ->map(function ($page) {
                $page->type = "page";
                $page->profileIMG = ProfilePic::where('id', $page->actualProfilePicID)->get(["profilePicURI"])->first();
                return $page;
            });
        $groups = Group::where(
            'name',
            'LIKE',
            $text . '%'
        )->orderBy('name', 'DESC')->get([
            "id", "actualProfileID", 'name'
        ])
            ->map(function ($group) {
                $group->type = "group";
                $group->profileIMG = ProfilePic::where('id', $group->actualProfileID)->get(["profilePicURI"])->first();
                return $group;
            });
        $events = Events::where(
            'name',
            'LIKE',
            $text . '%'
        )->orderBy('name', 'DESC')->get([
            "id", "actualProfilePicID", 'name'
        ])
            ->map(function ($event) {
                $event->type = "event";
                $event->profileIMG = ProfilePic::where('id', $event->actualProfilePicID)->get(["profilePicURI"])->first();
                return $event;
            });
        $combined = collect([$users, $pages, $groups, $events]);

        $flattened = $combined->flatMap(function ($item) {
            return $item;
        });

        $flattenedArray = $flattened->toArray();
        return $flattenedArray;
    }
}
