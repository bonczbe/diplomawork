<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alerts extends Model
{
    protected $fillable = [
        'userID',
    ];
    public $timestamps = false;
    use HasFactory;
}
