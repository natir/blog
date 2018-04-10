---
layout: default
title: Yet another bioinformatic blog
---


# Blog Posts :

{% for post in site.posts %}	

{% if post.tags.first != "draft" %}
- [{{ post.title }}]({{ post.url }})

{% endif %}

{% endfor %}

