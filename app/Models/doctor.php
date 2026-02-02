<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    protected $primaryKey = 'doc_id';
    public $incrementing = true; // اگر doc_id عددی است
    protected $keyType = 'int'; // اگر doc_id از نوع int است. اگر string، مقدار را 'string' بگذار

    protected $fillable = [
        'doc_id',
        'doc_name',
        'doc_last_name',
        'doc_section',
        'doc_phone',
        'doc_image',
    ];

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'doc_id', 'doc_id');
    }
}
