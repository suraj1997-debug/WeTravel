let icons = document.querySelectorAll('.sidebar .awitem .fas');
     icons.forEach(icon =>{
       icon.addEventListener('click',function(){
        icons.forEach(item => item.classList.remove('current'));
         this.classList.add('current');
       });
     });