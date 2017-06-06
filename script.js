'use strict';

function Notifications($Container) {
   var $ItemElm = $Container.find('[data-notifications-item]');
   var $ItemsElm = $Container.find('[data-notifications-items]');
   $ItemsElm.empty();
   var Self = this;
   
   this.Add = function(Wishes, ItemId, Item) {
      var $Item = $ItemElm.clone();
      $Item.find('[data-wishes-name]').text(Item.Name);
      $Item.find('[data-wishes-sell]').on('click', function() {Wishes.Sell(ItemId); Self.Remove($Item);});
      $Item.find('[data-notifications-close]').on('click', function() {Self.Remove($Item);});
      $Item.hide();
      $ItemsElm.append($Item);
      $Item.slideDown();
      setTimeout(function() {
         Self.Remove($Item);
      }, 60000);
   };
   
   this.Remove = function($Item) {
      $Item.slideUp('normal', function() {$Item.remove();});
   };
}

function List($Container, Notifications) {
   var $ItemElm = $Container.find('[data-wishes-item]');
   var $ItemsElm = $Container.find('[data-wishes-items]');
   var Url = $Container.data('wishes');
   var Self = this;
   var Items = null;
   
   this.Refresh = function() {
      $.ajax({url: Url, cache: false}).done(function(NewItems) {
         if('string' === typeof NewItems)
            NewItems = JSON.parse(NewItems);
         if(NewItems !== Items) {
            Items = NewItems;
            $ItemsElm.empty();

            $.each(Items, function(ItemId) {
               var $Item = $ItemElm.clone();
               var Item = this;
               $Item.find('[data-wishes-name]').text(this.Name);
               $Item.find('[data-wishes-link]').attr('href', this.Link);
               $Item.find('[data-wishes-bought-count]').text(this.BoughtCount);
               $Item.find('[data-wishes-wish-count]').text(this.WishCount);
               $Item.find('[data-wishes-buy]').on('click', function() {Self.Buy(ItemId, Item);});
               $Item.find('[data-wishes-sell]').on('click', function() {Self.Sell(ItemId, Item);});
               if(this.WishCount <= this.BoughtCount)
                  $Item.find('[data-wishes-buy]').hide();
               if(this.BoughtCount <= 0)
                  $Item.find('[data-wishes-sell]').hide();
               $ItemsElm.append($Item);
            });
         }
      });
   };
   
   this.Buy = function(ItemId, Item) {
      var Params = {
         ItemId: ItemId,
         List: Url
      };
      $.ajax('buy.php?'+$.param(Params)).done(function() {
         Notifications.Add(Self, ItemId, Item);
         Self.Refresh();
      });
   };
   
   this.Sell = function(ItemId) {
      var Params = {
         ItemId: ItemId,
         List: Url
      };
      $.ajax('sell.php?'+$.param(Params)).done(function() {
         Self.Refresh();
      });
   };
   
   this.Refresh();

   setInterval(function() {
      Self.Refresh();
   }, 60000);
}

$(function() {
   var Notificator = new Notifications($('[data-notifications]'));
   
   $('[data-wishes]').each(function() {
      new List($(this), Notificator);
   });
   
   // Open accordion if it contains the fragment element
   $(document.location.hash).filter('details').attr('open', true);
   $(document.location.hash).parents('details').attr('open', true);
   
   $('details > summary').each(function() {
      var $Summary = $(this);
      var $Details = $(this).parent();
      var $Wrapper = $Summary.nextAll().wrapAll('<div></div>').parent();
      
      if(!$Details.attr('open'))
         $Wrapper.hide();
      
      $Summary.click(function(Event) {
         Event.preventDefault();
         if($Details.attr('open')) {
            $Wrapper.slideUp(function() {
               $Details.removeAttr('open');
            });
         } else {
            $Details.attr('open', true);
            $Wrapper.slideDown();
         }
      });
   });
});
