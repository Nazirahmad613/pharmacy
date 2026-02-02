<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Registrations extends Model
{
    use HasFactory;

    protected $table = 'registrations';
    protected $primaryKey = 'reg_id';

    protected $fillable = [
        'reg_type',
        'full_name',
        'father_name',
        'phone',
        'gender',
        'age',
        'blood_group',
        'address',
        'visit_date',
        'note',
        'status',
    ];
}
