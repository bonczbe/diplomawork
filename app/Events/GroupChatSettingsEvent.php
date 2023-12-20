<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Groupchat;
use App\Models\Groupchathelper;

class GroupChatSettingsEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $groupID;
    public string $type;
    public $groupChat;
    //TODO: Emoji törlés listából
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(string $groupID, $groupChat, string $type)
    {
        $this->groupID = $groupID;
        $this->groupChat = $groupChat;
        $this->type = $type;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PresenceChannel('GroupChats.' . $this->groupID);
    }
    public function broadcastAs()
    {
        //Ez az event elnevezése a default helyett
        return $this->type;
    }
    public function broadcastWith()
    {
        return [
            "message" => $this->groupChat,
            "type" => $this->type
        ];
    }
}
