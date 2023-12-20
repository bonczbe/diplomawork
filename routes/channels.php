<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Groupchat;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

/* A channel for the user. It is used in the `resources/js/bootstrap.js` file. */

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

/* A channel for the group chat. It is used in the `resources/js/bootstrap.js` file. */
Broadcast::channel('GroupChats.{id}', function ($user, $id) {
    $helper = GroupChat::where('id', $id)->first();
    $user->name = $helper->name;
    $user->groupID = (int)$id;
    $user->type = "groupChat";
    return $user->only(['id', "groupID", 'name', 'type']);
});

/* A channel for the private chat. It is used in the `resources/js/bootstrap.js` file. */
Broadcast::channel('PrivateChats.{id}', function ($user, $id) {
    $user->name = $user->firstName . ' ' . (($user->middleName) ? ($user->middleName . ' ') : '') . $user->lastName;
    $user->type = "user";
    return $user->only(['id', 'tag', 'name', 'type']);
});

/* Used to broadcast the message to the group chat. */
Broadcast::channel('GroupChatsMessages.{id}', function ($user, $id) {
    $helper = GroupChat::where('id', $id)->first();
    $user->name = $helper->name;
    $user->groupID = (int)$id;
    $user->type = "groupChat";
    return $user->only(['id', "groupID", 'name', 'type']);
});
/* Used to broadcast the message to the private chat. */
Broadcast::channel('PrivateChatsMessages.{id}', function ($user, $id) {
    $user->name = $user->firstName . ' ' . (($user->middleName) ? ($user->middleName . ' ') : '') . $user->lastName;
    $user->type = "user";
    return $user->only(['id', 'tag', 'name', 'type']);
});



Broadcast::channel('users.{id}', function ($user, $id) {
    return $user;
});
Broadcast::channel('Alerts.{id}', function ($user, $id) {
    return $user;
});
