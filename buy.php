<?php

$ItemId = filter_input(INPUT_GET, 'ItemId');
$List = filter_input(INPUT_GET, 'List');

if(file_exists($List)) {
   $FileHandle = fopen($List, 'r+');
   
   if(flock($FileHandle, LOCK_EX)) {
      $Wishes = json_decode(fread($FileHandle, filesize($List)), JSON_OBJECT_AS_ARRAY);
      if(isset($Wishes[$ItemId]['BoughtCount']))
         $Wishes[$ItemId]['BoughtCount']++;
      ftruncate($FileHandle, 0);
      rewind($FileHandle);
      fwrite($FileHandle, json_encode($Wishes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
      flock($FileHandle, LOCK_UN);
   }

   fclose($FileHandle);
}
