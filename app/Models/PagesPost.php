<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PagesPost extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'pageID',
        'who',
        'text',
        'isFile'
    ];
    use HasFactory;
}
