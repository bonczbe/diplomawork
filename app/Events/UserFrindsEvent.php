<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserFrindsEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $userID;
    public string $type;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($userID, string $type)
    {
        //
        $this->userID = $userID;
        $this->type = $type;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PresenceChannel('users.' . $this->userID);
    }
    public function broadcastAs()
    {
        //Ez az event elnevezése a default helyett
        return $this->type;
    }
    public function broadcastWith()
    {
        return [
            "Message" => "Message"
        ];
    }
}
