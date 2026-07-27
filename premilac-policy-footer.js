(function(){
  function initPolicyFooter(){
    document.querySelectorAll('[data-policy-footer-toggle]').forEach(function(button){
      var targetId = button.getAttribute('aria-controls');
      var panel = document.getElementById(targetId);
      if(!panel) return;
      button.addEventListener('click', function(){
        var open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', open ? 'false' : 'true');
        panel.classList.toggle('is-open', !open);
      });
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initPolicyFooter);
  }else{
    initPolicyFooter();
  }
})();
