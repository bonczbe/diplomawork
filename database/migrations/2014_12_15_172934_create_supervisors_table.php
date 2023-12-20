<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    /**
     * It creates a table called supervisors with the following columns: id, email, email_verified_at,
     * email_verify, newPassHash, phone, tag, firstName, middleName, lastName, password, birthDate,
     * lastLoggedinDate, lastLoggedOutDate, resetedPasswd, isDark, role, and rememberToken.
     *
     * The first column, id, is the primary key. The email column is unique. The email_verified_at
     * column is nullable. The email_verify column is nullable. The newPassHash column is nullable. The
     * phone column is unique. The tag column is unique. The firstName column is not nullable. The
     * middleName column is nullable. The lastName column is not nullable. The password column is not
     * nullable. The birthDate column is not nullable. The lastLoggedinDate column is nullable. The
     * lastLogged
     */
    public function up()
    {
        Schema::create('supervisors', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('email_verify',512)->nullable()->unique();
            $table->string('newPassHash',512)->nullable()->unique();
            $table->string('phone',15)->unique();
            $table->string('tag',60)->unique();
            $table->string('firstName',15);
            $table->string('middleName',30)->nullable();
            $table->string('lastName',15);
            $table->string('password');
            $table->date('birthDate');
            $table->dateTime('lastLoggedinDate')->nullable();
            $table->dateTime('lastLoggedOutDate')->nullable();
            $table->string('resetedPasswd')->nullable();
            $table->boolean('isDark')->default(false);
            $table->integer('role'); //1: Admin, 2:Owner: can add anything and decide on everything
            $table->rememberToken();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('supervisors');
    }
};
