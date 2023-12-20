<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    public $timestamps = false;
    protected $fillable = [
        'email',
        'phone',
        'password',
        'firstName',
        'middleName',
        'lastName',
        'description',
        'birthDate',
        'password',
        'status',
        'canSeePostsAndImages',
        'canSeeBirthDate',
        'actualProfilePicID',
        'actualWallPaperID',
        'lastLoggedinDate',
        'lastLoggedOutDate',
        'resetedPasswd',
        'previousDiplom',
        'isLogin',
        'gender',
        'pronouns',
        'role',
        'tag',
        'isDark',
        'work',
        'school'
    ];

    protected $hidden = [];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    /**
     * This function returns the user that is currently logged in.
     * 
     * @return The user object.
     */
    public function user()
    {
        return Auth::guard('web')->user();
    }
}
