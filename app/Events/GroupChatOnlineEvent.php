<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Groupmessage;

class GroupChatOnlineEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $groupID;
    public string $type;
    public Groupmessage $Groupmessage;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($groupID, Groupmessage $Groupmessage, string $type)
    {
        //
        $this->groupID = $groupID;
        $this->Groupmessage = $Groupmessage;
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
            "message" => $this->Groupmessage,
            "type" => $this->type
        ];
    }
}
