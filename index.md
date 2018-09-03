---
layout: default
title: Yet Another Bioinformatic Blog
---


# Blog Posts :

{% assign posts = site.posts | where: "draft", "false" %}
{% for post in posts %}	

- [{{ post.title }}]({{ post.url }})

{% endfor %}

