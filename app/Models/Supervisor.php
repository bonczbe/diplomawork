<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\HasApiTokens;

class Supervisor extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    public $timestamps = false;
    protected $fillable = [
        'email',
        'phone',
        'email_verify',
        'newPassHash',
        'phone',
        'tag',
        'middleName',
        'firstName',
        'lastName',
        'birthDate',
        'resetedPasswd',
        'isDark',
        'role',

    ];

    protected $hidden = [];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    /**
     * It returns the currently authenticated user
     * 
     * @return The user object.
     */
    public function user()
    {
        return Auth::guard('supervisor')->user();
    }
    public function tokenCan($ability)
    {
        return $this->tokens->flatMap(function ($token) {
            return $token->abilities;
        })->contains($ability);
    }
}
