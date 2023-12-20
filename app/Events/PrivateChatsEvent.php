<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Messages;
use App\Models\MessagesData;

class PrivateChatsEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $relationsMergedID;
    public string $type;
    public MessagesData $MessagesData;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(string $relationsMergedID, MessagesData $MessagesData, string $type)
    {
        $this->relationsMergedID = $relationsMergedID;
        $this->type = $type;
        $this->MessagesData = $MessagesData;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PresenceChannel('PrivateChats.' . $this->relationsMergedID);
    }
    public function broadcastAs()
    {
        //Ez az event elnevezése a default helyett
        return $this->type;
    }
    public function broadcastWith()
    {
        return [
            "message" => $this->MessagesData,
            "type" => $this->type
        ];
    }
}
