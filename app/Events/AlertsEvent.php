<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Alerts;

class AlertsEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $userID;
    public string $type;
    public Alerts $alert;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($userID, Alerts $alert, string $type)
    {
        //
        $this->userID = $userID;
        $this->alert = $alert;
        $this->type = $type;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('Alerts.' . $this->userID);
    }
    public function broadcastAs()
    {
        //Ez az event elnevezése a default helyett
        return $this->type;
    }
    public function broadcastWith()
    {
        return [
            "message" => $this->alert->toArray()
        ];
    }
}
