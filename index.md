---
layout: default
---


## Blog Posts :

{% for post in site.posts %}	

{% if post.tags.first != "draft" %}
- [{{ post.title }}]({{ post.url }})

{% endif %}

{% endfor %}

