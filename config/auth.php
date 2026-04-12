<?php

return [

    'defaults' => [
    'guard' => 'sanctum',
    'passwords' => 'users',
],

'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'sanctum' => [
        'driver' => 'sanctum',
        'provider' => 'users',
    ],
],
];
